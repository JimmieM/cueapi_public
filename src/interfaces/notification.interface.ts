import { IEvent } from './event.interface';

export interface INotification {
    id: number;
    signalId: number;
    event: IEvent;
    datetime: Date;
    timeago: string;
}
