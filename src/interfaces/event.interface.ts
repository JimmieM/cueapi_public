import { IPosition, ILatLng } from './position.interface';
export type locationGPSType = 'initial' | 'authorized' | 'suggested';

export interface IEvent {
    id: number;
    datetime: string | Date;
    updated: string | Date;
    fetched?: string;
    approves?: number;
    timeago: string;
    updatedTimeago: string;
    name: string;
    summary: string;
    suggestedEvents?: IEvent[];
    url: string;
    authorized: boolean;
    type: string;
    extraTypes?: string[];
    keywords: string[];
    LocationGPSType: locationGPSType;
    initial_latlng?: ILatLng;
    location: IPosition;
    crime_rate_recorded: boolean;
    archived: boolean;
}

export interface IAuthorizedEvent {
    id: number;
    datetime: string | Date;
    name: string;
    summary: string;
    url: string;
    type: string;
    LocationGPSType: locationGPSType;
    location: {
        name: string;
        gps: string;
        radius?: number;
    };
}

export interface ICreateSuggestedEvent {
    type: number;
    userId: number;
    location: IPosition;
    description: string;
}

export interface ISuggestEventLocation {
    eventId: number;
    id: number;
    userId: number;
    location: IPosition;
}
