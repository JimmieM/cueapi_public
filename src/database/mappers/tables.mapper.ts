import { ListenerType } from '../../interfaces/signal.interface';
import { locationGPSType } from '../../interfaces/event.interface';

export enum Tables {
    Events = 'events',
    Signals = 'signals',
    Users = 'users',
    Notifications = 'notifications',
    CustomLocations = 'custom_locations',
    SuggestedEvents = 'suggested_events',
    SuggestedEventLocations = 'suggested_event_locations',
    BlacklistedLocations = 'blacklisted_locations',
    Logs = 'logs',
    HighCrimerate = 'high_crime_rate',
    ReportedBugs = 'reported_bugs',
    ReportedSuggestedEvents = 'reported_suggested_events',
    GeolocationRequests = 'geolocation_requests',
}

export enum TableOperator {
    YES = 1,
    NO = 0,
}

export interface GeolocationRequestTable {
    id: number;
    request_type: string;
    status: number;
    user_id: number;
    event_id: number;
    message: string;
}

export interface DbReportSuggestedEventsTable {
    id: number;
    user_id: number;
    event_id: number;
    created: string;
    verified: number;
}

export interface DbHighCrimerateTable {
    id: number;
    lat: string;
    lng: string;
    city: string;
    radius: number;
    event_type: number;
    created: string;
    updated: string;
    event_ids: string;
    event_latlngs: string;
    events_time_within_minutes: number;
}

export interface DbLogsTable {
    id: number;
    error_message: string;
    namespace: string;
    datetime: string;
    user_id: number | null;
    level: number;
}

export interface DbSuggestedEventsTable {
    id: number;
    type: number;
    city: string;
    description: string;
    street?: string;
    gps_lat: string;
    gps_lng: string;
    user_id: number;
    approves: number;
    created: string;
    updated: string;
    located_event_id: number;
    archived: number;
}

export interface DbSuggestedEventLocationsTable {
    id: number;
    user_id: number;
    event_id: number;
    gps_lat: string;
    gps_lng: string;
    gps_radius: number;
    date_created: string;
}

export interface DbUsersTable {
    id: number;
    device_os: string;
    device_token: string;
    premium: number;
    created: string;
    karma: number;
}

export interface DbBlacklistedLocationsTable {
    id: number;
    streetname: string;
    city: string;
}

export interface DbSignalsTable {
    id: number;
    user_id: number;
    position_lng: string;
    position_lat: string;
    position_city: string;
    position_streetname: string;
    duration_minutes: number;
    name: string;
    keywords: string;
    strict_keywords: number;
    event_type: string;
    position_radius: number;
    listener_type: ListenerType;
    date_created: string;
    notified: number;
}

export interface DbCustomLocationsTable {
    id: number;
    city: string;
    streetname: string;
    streetnumber?: number;
    gps_lat: string;
    gps_lng: string;
    date_created: string;
    verification: string;
}

export interface DbNotificationsTable {
    id: number;
    user_id: number;
    event_id: number;
    signal_id: number;
    datetime: string;
}

export interface DbEventsTable {
    id: number;
    datetime: string;
    updated: string;
    fetched: string;
    authorized: number;
    name: string;
    summary: string;
    url: string;
    keywords: string;
    type: string;
    locationname: string;
    initial_locationgps: string;
    locationgps: string;
    locationgps_type: locationGPSType;
    custom_locationradius: number;
    crime_rate_recorded: number;
    archived: number;
}
