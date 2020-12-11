import axios from 'axios';
import { IAuthorizedEvent, IEvent } from '../interfaces/event.interface';
import { EventsMicroservice } from '../database/microservices/events.ms';
import { KeywordsService } from './keywords.service';
import { Position } from './position.service';
import { CustomLocationsMicroservice } from '../database/microservices/custom-locations.ms';
import { ILatLng } from '../interfaces/position.interface';
import { BlacklistedLocationsMicroservice } from '../database/microservices/blacklisted-locations.ms';
import { EventsFactory } from '../database/factories/events.factory';
import { LogService } from './log.service';
import { TimeService } from './time';
import { SuggestedEventsMicroservice } from '../database/microservices/suggested-events.ms';
import { SuggestedEventsService } from './suggested-events.service';
import { CoordsHelper } from '../helpers/coords.helper';
import { DbCustomLocationsTable } from '../database/mappers/tables.mapper';

const Logger = new LogService('events.service');

export namespace EventsService {
    export const fetchEvents = async (): Promise<boolean[]> => {
        const url: string = 'https://polisen.se/api/events';
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Cue - Händelser i Sverige (723757978)',
                },
            });
            if (response.status !== 200) {
                Logger.Log(
                    `${url} returned ${response.status}. Text: ${response.statusText}`,
                    4,
                );
            }
            const data = response.data as IAuthorizedEvent[];

            return await AddEvents(data);
        } catch (exception) {
            Logger.Log(
                `ERROR received from ${url} \n e: ${JSON.stringify(exception)}`,
                4,
            );
            return null;
        }
    };

    const EventVagueLocationHasLatlng = async (
        possibleLocations: string[],
        initialCity: string,
        street?: string,
    ): Promise<ILatLng> => {
        const customLocationPromises: Promise<DbCustomLocationsTable>[] = [];
        for (let index = 0; index < possibleLocations.length; index++) {
            const loc = possibleLocations[index];
            customLocationPromises.push(
                CustomLocationsMicroservice.GetCustomLocation(
                    street ? street : '',
                    initialCity,
                    loc,
                ),
            );
        }

        const customLocations = await Promise.all(customLocationPromises);
        const hasCustomLocation = customLocations.find((cl) => cl !== null);
        if (hasCustomLocation) {
            return {
                lat: Number(hasCustomLocation.gps_lat),
                lng: Number(hasCustomLocation.gps_lng),
            };
        }

        const latLngPromises: Promise<
            ILatLng & {
                streetName?: string;
                city?: string;
                vagueLocation?: string;
            }
        >[] = [];
        if (possibleLocations && possibleLocations.length > 0) {
            for (let i = 0; i < possibleLocations.length; i++) {
                const loc = possibleLocations[i];
                latLngPromises.push(
                    Position.GetLatLng(street, initialCity, loc),
                );
            }
        }

        if (latLngPromises.length > 0) {
            const latlngs = await Promise.all(latLngPromises);
            for (let i = 0; i < latlngs.length; i++) {
                const currentLatLng = latlngs[i];
                if (currentLatLng) {
                    await CustomLocationsMicroservice.AddCustomLocation(
                        '',
                        initialCity,
                        currentLatLng as ILatLng,
                        currentLatLng.vagueLocation,
                    );
                    return currentLatLng;
                }
            }
        }
        return null;
    };

    const EventStreetHasLatLng = async (
        street: string,
        initialCity: string,
    ): Promise<ILatLng | null> => {
        const customLocation = await CustomLocationsMicroservice.GetCustomLocation(
            street,
            initialCity,
            null,
        );

        if (customLocation) {
            return {
                lat: Number(customLocation.gps_lat),
                lng: Number(customLocation.gps_lng),
            };
        }

        return await Position.GetLatLng(street, initialCity);
    };

    export const PossibleKeywordsHasLatLng = async (
        initialCity: string,
        possibleLocations: string[],
        street?: string,
    ): Promise<ILatLng | null> => {
        if (street) {
            const isBlacklisted = await BlacklistedLocationsMicroservice.GetBlacklistedLocation(
                street,
                initialCity,
            );
            if (isBlacklisted) {
                return null;
            }
        }

        if (!street && possibleLocations.length > 0) {
            return await EventVagueLocationHasLatlng(
                possibleLocations,
                initialCity,
                street,
            );
        }

        const latLng = await EventStreetHasLatLng(street, initialCity);

        if (latLng) {
            await CustomLocationsMicroservice.AddCustomLocation(
                street ? street : '',
                initialCity,
                latLng,
            );
            return latLng;
        } else {
            await BlacklistedLocationsMicroservice.AddBlacklistedLocation(
                street ? street : '',
                initialCity,
            );
            return null;
        }
    };

    export const ProcessEventData = async (
        event: IAuthorizedEvent,
    ): Promise<IAuthorizedEvent & { keywords?: string[] }> => {
        const returnableEvent = JSON.parse(
            JSON.stringify(event),
        ) as IAuthorizedEvent;

        if (KeywordsService.EventShouldBeLocated(returnableEvent.summary)) {
            return;
        }
        const hasLocation = KeywordsService.HasLocations(
            returnableEvent.summary.split(' '),
            returnableEvent.location.name,
        );

        if (
            hasLocation.possibleStreets.length > 0 ||
            hasLocation.possibleLocations.length > 0
        ) {
            const latlng = await PossibleLatLng(
                returnableEvent,
                hasLocation.possibleStreets,
                hasLocation.possibleLocations,
            );

            if (latlng) {
                returnableEvent.location.gps = `${latlng.lat},${latlng.lng}`;
                returnableEvent.LocationGPSType = 'authorized';
                returnableEvent.location.radius = 175;
                return {
                    ...returnableEvent,
                    keywords: latlng.keywords,
                };
            }
            return returnableEvent;
        }

        return returnableEvent;
    };

    const PossibleLatLng = async (
        event: IAuthorizedEvent,
        possibleStreets: string[],
        possibleLocations: string[],
    ): Promise<(ILatLng & { keywords?: string[] }) | null> => {
        if (possibleStreets.length === 0) {
            const hasLatlng = await PossibleKeywordsHasLatLng(
                event.location.name,
                possibleLocations,
            );
            if (hasLatlng) {
                return {
                    ...hasLatlng,
                    keywords: possibleLocations,
                };
            }
        }

        let latlng: ILatLng & { keywords?: string[] };
        for (let index = 0; index < possibleStreets.length; index++) {
            const street = possibleStreets[index];

            const hasLatlng = await PossibleKeywordsHasLatLng(
                event.location.name,
                possibleLocations,
                street,
            );
            if (hasLatlng) {
                latlng = {
                    ...hasLatlng,
                    keywords: [...possibleLocations, street],
                };
                break;
            }
        }
        return latlng;
    };

    const AddOrUpdateEvent = async (
        event: IAuthorizedEvent,
    ): Promise<boolean> => {
        const eventExist = await EventsMicroservice.GetEventById(
            event.id,
            event.type,
        );

        event.LocationGPSType = 'initial';
        event.location.radius = 1500;
        if (eventExist) {
            let needsUpdate = false;
            let hasNewCoords = false;
            if (eventExist.initial_locationgps) {
                needsUpdate =
                    eventExist.summary.toLowerCase() !==
                        event.summary.toLowerCase() ||
                    eventExist.locationname.toLowerCase() !==
                        event.location.name.toLowerCase() ||
                    eventExist.initial_locationgps.toLowerCase() !==
                        event.location.gps.toLowerCase();

                hasNewCoords =
                    eventExist.initial_locationgps.toLowerCase() !==
                    event.location.gps.toLowerCase();
            } else {
                needsUpdate = true;
            }
            if (needsUpdate && eventExist.locationgps_type === 'initial') {
                if (hasNewCoords) {
                    const processedEvent = await ProcessEventData(event);
                    if (processedEvent) {
                        const updatedEvent = EventsFactory.AuthorizedToEvent(
                            processedEvent,
                            CoordsHelper.StringToLatLng(event.location.gps),
                        );

                        Logger.Log(`Updating event ${processedEvent.id}`, 1);
                        return await EventsMicroservice.UpdateEvent({
                            ...updatedEvent,
                            updated: TimeService.DateTime(),
                        });
                    }
                } else {
                    const updatedEvent = EventsFactory.AuthorizedToEvent(
                        event,
                        CoordsHelper.StringToLatLng(event.location.gps),
                    );
                    Logger.Log(`Updating event Without coords ${event.id}`, 1);
                    return await EventsMicroservice.UpdateEvent({
                        ...updatedEvent,
                        updated: TimeService.DateTime(),
                    });
                }
            }
            return false;
        } else {
            if (new Date(event.datetime) > new Date(TimeService.DateTime())) {
                Logger.Log(
                    `${event.id} has date that havent happened ${event.datetime}`,
                    1,
                );
                return;
            }

            const processedEvent = await ProcessEventData(event);
            if (processedEvent) {
                const createdEvent = EventsFactory.AuthorizedToEvent(
                    {
                        ...processedEvent,
                        datetime: processedEvent.datetime,
                    },
                    CoordsHelper.StringToLatLng(event.location.gps),
                );
                Logger.Log(`Adding event ${event.id}`, 1);
                await EventsMicroservice.AddAuthorizedEvent(createdEvent);
            }
            return false;
        }
    };

    const blacklist = [
        'hemsidan uppdateras inte mer',
        'Hemsidan/händelser uppdateras inte mer',
        'ingen kommunikatör i tjänst',
        'information om polisens pressnummer',
        'polisens presstjänst',
        'dagens presstalesperson',
    ];

    const AddEvents = async (events: IAuthorizedEvent[]) => {
        const getSuggestedEvents = await SuggestedEventsMicroservice.GetRecentSuggestedEvents(
            150,
        );
        const suggestedEvents = EventsFactory.SuggestedEvents(
            getSuggestedEvents,
        );

        const eventPromises: Promise<boolean>[] = [];
        const now = new Date(TimeService.DateTime()).getTime();
        const HOUR = 1000 * 125 * 110;
        const anHourAgo = now - HOUR;
        for (let index = 0; index < events.length; index++) {
            const event = events[index];

            const eventIsWithinADayOrSo =
                new Date(event.datetime).getTime() > anHourAgo;

            if (!eventIsWithinADayOrSo) continue;

            const isBlacklisted = blacklist.some((b) =>
                event.summary.toLowerCase().includes(b.toLowerCase()),
            );
            if (isBlacklisted) continue;

            eventPromises.push(
                new Promise(async (res) => {
                    const addedOrUpdated = await AddOrUpdateEvent(event);
                    if (
                        addedOrUpdated &&
                        getSuggestedEvents &&
                        getSuggestedEvents.length > 0
                    ) {
                        const item = await EventsMicroservice.GetEvent(
                            event.id,
                        );
                        if (item) {
                            EventHasCorrespondingSuggestions(
                                EventsFactory.Event(item),
                                suggestedEvents,
                            );
                        }
                    }
                    res(addedOrUpdated);
                }),
            );
        }

        return await Promise.all(eventPromises);
    };

    const EventHasCorrespondingSuggestions = (
        event: IEvent,
        suggestedEvents: IEvent[],
    ) => {
        const correspondingEvents = SuggestedEventsService.EventHasCorrespondingCustomEvents(
            event,
            suggestedEvents,
        );
        if (correspondingEvents && !!correspondingEvents.length) {
            correspondingEvents.forEach(async (suggestedEvent) => {
                const setId = await SuggestedEventsMicroservice.SetLocatedEventId(
                    suggestedEvent.id,
                );
                if (!setId) {
                    Logger.Log(
                        'Failed to set located event for suggid' +
                            suggestedEvent.id +
                            ' for eventid: ' +
                            event.id,
                        4,
                    );
                }
            });
        }
    };

    export const localEvents = async () => {
        const fs = require('fs');
        fs.readFile(
            __dirname + '/../../resources/events/events.json',
            'utf8',
            async (err: Error, jsonString: string) => {
                if (err) {
                    return;
                }
                const obj = JSON.parse(jsonString) as IAuthorizedEvent[];
                await AddEvents(obj);
            },
        );
    };
}
