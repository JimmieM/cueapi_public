import { DbConnector } from '../connector.database';
import { Tables, DbReportSuggestedEventsTable } from '../mappers/tables.mapper';

export namespace ReportedSuggestedEventsMicroservice {
    export const AddReport = (
        userId: number,
        eventId: number,
    ): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `INSERT INTO ${Tables.ReportedSuggestedEvents} 
                (user_id, event_id, created)
                VALUES
                (${userId}, ${eventId})`,
                (err: any) => {
                    if (err) {
                        reject(false);
                    } else {
                        resolve(true);
                    }
                },
            );
        });
    };

    export const GetReportsByUserId = (
        userId: number,
    ): Promise<DbReportSuggestedEventsTable[]> => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `SELECT * FROM ${Tables.ReportedSuggestedEvents} 
                WHERE user_id = ${userId}`,
                (err: any, rows: any) => {
                    if (err) {
                        reject(null);
                    } else {
                        resolve(rows);
                    }
                },
            );
        });
    };

    export const GetReportsByEventId = (
        eventId: number,
    ): Promise<DbReportSuggestedEventsTable[]> => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `SELECT * FROM ${Tables.ReportedSuggestedEvents} 
                WHERE event_id = ${eventId}`,
                (err: any, rows: any) => {
                    if (err) {
                        reject(null);
                    } else {
                        resolve(rows);
                    }
                },
            );
        });
    };

    export const GetReport = (
        userId: number,
        eventId: number,
    ): Promise<DbReportSuggestedEventsTable> => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `SELECT * FROM ${Tables.ReportedSuggestedEvents} 
                WHERE user_id = ${userId} AND event_id = ${eventId}`,
                (err: any, rows: any) => {
                    if (err) {
                        reject(null);
                    } else {
                        resolve(rows && rows.length > 0 ? rows[0] : null);
                    }
                },
            );
        });
    };
}
