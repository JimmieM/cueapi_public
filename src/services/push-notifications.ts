import apn from 'apn';
import { LogService } from './log.service';
import { UsersMicroservice } from '../database/microservices/users.ms';

const Logger = new LogService('push-notifications.service');

export interface IPushNotification {
    userId: number;
    devicetoken: string;
    notification: {
        id: number;
        type: string;
        data: string;
        exp: number;
    };
}

export namespace PushNotificationsService {
    const options = {
        token: {
            key: __dirname + '/../../resources/apn/AuthKey_9WFY994UUS.p8',
            keyId: 'key-id',
            teamId: 'team-id',
        },
        production: true,
    };

    const apnProvider = new apn.Provider(options);

    export const APN = async (notification: IPushNotification) => {
        const note = new apn.Notification();
        note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
        note.badge = 1;
        note.sound = 'ping.aiff';
        note.alert = notification.notification.data;
        note.payload = { data: notification.notification };
        note.topic = 'se.app.cue';

        const send = await apnProvider.send(note, notification.devicetoken);
        if (send) {
            if (send.failed.length > 0) {
                send.failed.map((e) => {
                    // Set old device token as boolean on user or something for this not to happen
                    if (
                        e.status === '400' &&
                        e.response.reason === 'BadDeviceToken'
                    ) {
                        UsersMicroservice.NullDeviceToken(notification.userId);
                    }
                    Logger.Log(JSON.stringify(e), 3, notification.userId);
                });
            }
            return true;
        }
        return false;
    };
}
