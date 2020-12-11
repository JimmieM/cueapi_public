import { DbNotificationsTable, DbEventsTable } from '../mappers/tables.mapper';
import { INotification } from '../../interfaces/notification.interface';
import { EventsFactory } from './events.factory';
import { TimeService } from '../../services/time';

export namespace NotificationsFactory {
    export const Notification = (
        notif: DbNotificationsTable,
        event: DbEventsTable,
    ): INotification => ({
        id: notif.id,
        signalId: notif.signal_id,
        event: EventsFactory.Event(event),
        datetime: new Date(notif.datetime),
        timeago: TimeService.timeAgo(new Date(notif.datetime)),
    });

    export const Notifications = (
        arr: [{ notif: DbNotificationsTable; event: DbEventsTable }],
    ): INotification[] => {
        const notifications: INotification[] = [];
        arr.map((i) => {
            notifications.push(
                NotificationsFactory.Notification(i.notif, i.event),
            );
        });
        return notifications;
    };
}
