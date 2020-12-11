import { DbConnector } from '../connector.database';
import { Tables, DbNotificationsTable } from '../mappers/tables.mapper';
import { TimeService } from '../../services/time';
import { LogService } from '../../services/log.service';

const Logger = new LogService('notifications.microservice');

export namespace NotificationsMicroservice {
    export const GetNotification = (
        eventId: number,
        signalId: number,
    ): Promise<DbNotificationsTable | null> => {
        return new Promise((resolve) => {
            DbConnector.Connection.query(
                `SELECT * FROM ${Tables.Notifications} WHERE event_id = ${eventId} AND signal_id = ${signalId}`,
                (err: any, rows: any) => {
                    if (err) {
                        Logger.Log(`code: ${err.code} `, 3);
                        resolve(null);
                    } else {
                        resolve(rows ? rows[0] : null);
                    }
                },
            );
        });
    };

    export const GetRecentNotifications = (
        userId: number,
        durationMinutes: number,
    ): Promise<DbNotificationsTable[] | null> => {
        return new Promise((resolve) => {
            DbConnector.Connection.query(
                `SELECT * FROM ${Tables.Notifications} WHERE user_id = ${userId} AND datetime >= NOW() - INTERVAL ${durationMinutes} MINUTE ORDER BY datetime DESC`,
                (err: any, rows: any) => {
                    if (err) {
                        Logger.Log(`code: ${err.code} `, 3);
                    }

                    if (!rows) {
                        resolve(null);
                    } else resolve(rows);
                },
            );
        });
    };

    export const AddNotification = (
        eventId: number,
        signalId: number,
        userId: number,
    ): Promise<boolean> => {
        return new Promise((resolve) => {
            DbConnector.Connection.query(
                `INSERT INTO ${
                    Tables.Notifications
                } (event_id, signal_id, user_id, datetime) VALUES (${eventId}, ${signalId}, ${userId}, '${TimeService.DateTime()}')`,
                (err: any) => {
                    if (err) {
                        Logger.Log(`code: ${err.code} `, 3);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                },
            );
        });
    };
}
