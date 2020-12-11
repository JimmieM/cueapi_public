import { EventsMicroservice } from '../database/microservices/events.ms';
import {
    IEvent,
    ICreateSuggestedEvent,
    ISuggestEventLocation,
} from '../interfaces/event.interface';
import { Position } from '../services/position.service';
import { EventsFactory } from '../database/factories/events.factory';
import { EventsService } from '../services/events.service';
import { SuggestedEventsMicroservice } from '../database/microservices/suggested-events.ms';
import { SuggestedEventLocationMicroservice } from '../database/microservices/suggested-event-location.ms';
import { SuggestedEventLocations } from '../services/suggested-event-locations.service';
import { CoordsHelper } from '../helpers/coords.helper';
import { ReportedSuggestedEventsMicroservice } from '../database/microservices/reported-suggested-events.ms';
import { SuggestedEventsService } from '../services/suggested-events.service';

export namespace EventsGateway {
    export const CreateSuggestedEvent = async (
        event: ICreateSuggestedEvent,
    ) => {
        const getCitynStreet = await Position.GetCityAndStreetname(
            event.location.gps.lat,
            event.location.gps.lng,
        );
        if (getCitynStreet) {
            const mutatedEvent: ICreateSuggestedEvent = {
                ...event,
                location: {
                    ...event.location,
                    city: getCitynStreet.city,
                    streetname: getCitynStreet.streetName,
                },
            };
            const add = await SuggestedEventsMicroservice.AddSuggestedEvent(
                mutatedEvent,
            );
            return add;
        }
        return false;
    };

    export const GetRecentSuggestedEvents = async (
        minutes: number,
        city: string,
        userId?: number,
    ): Promise<IEvent[]> => {
        const getRecent = await SuggestedEventsMicroservice.GetRecentSuggestedEvents(
            minutes,
            null,
            [city],
        );

        if (getRecent) {
            const events = EventsFactory.SuggestedEvents(getRecent);
            if (userId) {
                const getReportedEvents = await ReportedSuggestedEventsMicroservice.GetReportsByUserId(
                    userId,
                );
                if (getReportedEvents && getReportedEvents.length > 0) {
                    return events.filter(
                        (e) =>
                            getReportedEvents.find(
                                (d) => d.event_id === e.id,
                            ) === undefined,
                    );
                }
                return events;
            }
            return events;
        }
        return [];
    };

    export const SuggestEventLocation = async (
        item: ISuggestEventLocation,
    ): Promise<boolean> => {
        const currentSuggestions = await GetSuggestedEventLocations(
            item.eventId,
        );
        if (currentSuggestions.length === 0) {
            // suggest.
            return await SuggestedEventLocationMicroservice.AddSuggestion(item);
        } else {
            const withinBounds = SuggestedEventLocations.SuggestedLatLngIsWithinBounds(
                item.location.gps,
                currentSuggestions.map((c) => c.location.gps),
            );
            if (withinBounds) {
                const add = await SuggestedEventLocationMicroservice.AddSuggestion(
                    item,
                );
                if (add) {
                    const center = [
                        ...currentSuggestions.map((c) => c.location.gps),
                        item.location.gps,
                    ];
                    return await EventsMicroservice.UpdateGPS(
                        item.eventId,
                        CoordsHelper.GetCenter(center),
                        'suggested',
                    );
                }
            }
        }
        return false;
    };

    export const GetSuggestedEventLocations = async (
        eventId: number,
    ): Promise<ISuggestEventLocation[]> => {
        const suggestions = await SuggestedEventLocationMicroservice.GetSuggestions(
            eventId,
        );
        return EventsFactory.SuggestedEventLocations(suggestions);
    };

    export const UpvoteSuggestedEvent = async (
        eventId: number,
    ): Promise<boolean> => {
        return await SuggestedEventsMicroservice.Upvote(eventId);
    };

    export const ReportSuggestedEvent = async (
        eventId: number,
        userId: number,
    ): Promise<boolean> => {
        const reportExist = await ReportedSuggestedEventsMicroservice.GetReport(
            userId,
            eventId,
        );
        if (reportExist) return false;

        const currentReports = await ReportedSuggestedEventsMicroservice.GetReportsByEventId(
            eventId,
        );
        if (currentReports && currentReports.length > 7) {
            return SuggestedEventsService.ArchiveSuggestedEvent(
                eventId,
                currentReports.map((report) => report.id),
            );
        }

        const add = await ReportedSuggestedEventsMicroservice.AddReport(
            userId,
            eventId,
        );
        return add;
    };

    export const RequestUpdate = async () => {
        return await EventsService.localEvents();
    };

    export const FetchRecentEvents = async (
        minutes: number,
        eventType?: string[],
        cities?: string[],
    ): Promise<IEvent[]> => {
        const events = await EventsMicroservice.GetRecentEvents(
            minutes,
            eventType,
            [...new Set(cities)],
        );
        return EventsFactory.Events(events);
    };

    export const FetchEvents = async () => {
        const events = await EventsMicroservice.GetEvents();
        return EventsFactory.Events(events);
    };

    export const FetchLocalEvents = async (
        minutes: number,
        cities: string[],
    ): Promise<{ city: string; events: IEvent[] }> => {
        const getEvents = await EventsMicroservice.GetEventsInCity(
            minutes,
            cities,
        );

        if (getEvents && !!getEvents.length) {
            const events = getEvents.map(async (e) => {
                const getSuggestedEvents = await SuggestedEventsMicroservice.GetByLocatedEventId(
                    e.id,
                );
                return EventsFactory.Event(e, getSuggestedEvents);
            });

            return {
                city: cities[0],
                events: await Promise.all(events),
            };
        }
        return {
            city: cities[0] || '',
            events: [],
        };
    };
}
