import {
    DbEventsTable,
    DbSuggestedEventsTable,
    DbSuggestedEventLocationsTable,
} from '../mappers/tables.mapper';
import {
    IEvent,
    IAuthorizedEvent,
    ISuggestEventLocation,
} from '../../interfaces/event.interface';
import { TimeService } from '../../services/time';
import { EventTypes } from '../../models/events-types.model';
import { ILatLng } from '../../interfaces/position.interface';
import { CoordsHelper } from '../../helpers/coords.helper';

export namespace EventsFactory {
    export const AuthorizedToEvent = (
        item: IAuthorizedEvent & { keywords?: string[] },
        initialLatLng: ILatLng,
    ): IEvent => {
        return {
            id: item.id,
            datetime: item.datetime,
            updated: item.datetime,
            crime_rate_recorded: false,
            authorized: true,
            approves: 0,
            fetched: TimeService.DateTime(),
            timeago: TimeService.timeAgo(new Date(item.datetime)),
            updatedTimeago: TimeService.timeAgo(new Date(item.datetime)),
            name: item.name,
            summary: item.summary,
            url: item.url,
            type: item.type,
            keywords: item.keywords,
            initial_latlng: initialLatLng,
            LocationGPSType: item.LocationGPSType,
            location: {
                city: item.location.name,
                gps: CoordsHelper.StringToLatLng(item.location.gps),
                radius: item.location.radius,
                streetname: '',
                timestamp: Date.now(),
            },
            archived: false,
        };
    };

    export const SuggestedEventLocations = (
        events: DbSuggestedEventLocationsTable[],
    ): ISuggestEventLocation[] => {
        const arr: ISuggestEventLocation[] = [];
        events.map((e) => {
            arr.push({
                id: e.id,
                userId: e.user_id,
                eventId: e.event_id,
                location: {
                    gps: {
                        lat: Number(e.gps_lat),
                        lng: Number(e.gps_lng),
                    },
                    radius: e.gps_radius,
                    timestamp: new Date(e.date_created).getTime(),
                },
            });
        });
        return arr;
    };

    export const SuggestedEvents = (events: DbSuggestedEventsTable[]) => {
        const arr: IEvent[] = [];
        if (events) {
            events.map((e) => {
                arr.push({
                    id: e.id,
                    crime_rate_recorded: false,
                    authorized: false,
                    datetime: new Date(e.created),
                    updated: new Date(e.updated),
                    timeago: TimeService.timeAgo(new Date(e.created)),
                    updatedTimeago: TimeService.timeAgo(new Date(e.updated)),
                    keywords: [],
                    name: 'Händelse av användare #' + e.id,
                    summary: e.description,
                    url: '',
                    type:
                        EventTypes.find((t) => t.id === e.type).names[0] ||
                        'Övrigt',

                    extraTypes:
                        EventTypes.find((t) => t.id === e.type).names || [],
                    LocationGPSType: 'suggested',
                    location: {
                        city: e.city,
                        gps: {
                            lat: Number(e.gps_lat),
                            lng: Number(e.gps_lng),
                        },
                        radius: 0,
                        streetname: e.street,
                        timestamp: Date.now(),
                    },
                    archived: e.archived === 1 ? true : false,
                    approves: e.approves,
                });
            });
        }
        return arr;
    };

    export const Event = (
        e: DbEventsTable,
        suggestedEvents?: DbSuggestedEventsTable[],
    ): IEvent => {
        return {
            id: e.id,
            authorized: e.authorized === 1 ? true : false,
            crime_rate_recorded: e.crime_rate_recorded === 1 ? true : false,
            datetime: new Date(e.datetime),
            updated: new Date(e.updated),
            timeago: TimeService.timeAgo(new Date(e.datetime)),
            updatedTimeago: TimeService.timeAgo(new Date(e.updated)),
            keywords: JSON.parse(e.keywords) || [],
            name: e.name,
            summary: e.summary,
            url: e.url,
            type: e.type,
            suggestedEvents: EventsFactory.SuggestedEvents(suggestedEvents),
            LocationGPSType: e.locationgps_type,
            location: {
                radius: e.custom_locationradius,
                timestamp: Date.now(),
                city: e.locationname,
                gps: {
                    lat: Number(e.locationgps.split(',')[0]),
                    lng: Number(e.locationgps.split(',')[1]),
                },
            },
            archived: e.archived === 1 ? true : false,
        };
    };

    export const Events = (events: DbEventsTable[]): IEvent[] => {
        const arr: IEvent[] = [];

        if (events) {
            events.map((e) => {
                arr.push(Event(e));
            });
        }
        return arr;
    };
}
