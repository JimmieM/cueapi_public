import { INotification } from '../interfaces/notification.interface';
import { NotificationsMicroservice } from '../database/microservices/notifications.ms';
import { EventsMicroservice } from '../database/microservices/events.ms';
import { NotificationsFactory } from '../database/factories/notifications.factory';

export namespace NotificationsGateway {
    export const GetRecentNotificationsByUserId = async (
        userId: number,
        minutes: number,
    ): Promise<INotification[] | null> => {
        const notifications = await NotificationsMicroservice.GetRecentNotifications(
            userId,
            minutes,
        );
        if (notifications) {
            const notificationsPromises = notifications.map(async (n) => {
                const event = await EventsMicroservice.GetEvent(n.event_id);

                if (event) {
                    return NotificationsFactory.Notification(n, event);
                }
                return null;
            });
            return Promise.all(notificationsPromises);
        }
        return null;
    };
}
