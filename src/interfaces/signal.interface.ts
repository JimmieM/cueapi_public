import { IPosition } from './position.interface';

export type ListenerType = 'city' | 'street' | 'radius';

export interface ISignal {
    id: number;
    userId: number;
    position: IPosition;
    eventType: number[];
    listenerType: ListenerType;
    name: string;
    durationMinutes: number;
    notified: boolean;
    keywords: string[];
    strictKeywords: boolean;
}

export interface ICreateSignal {
    id?: number;
    userId: number;
    position: IPosition;
    city?: string;
    county?: string;
    streetname?: string;
    listenerType: ListenerType;
    keywords: string[];
    name: string;
    eventType: number[];
    strictKeywords: boolean;
}
