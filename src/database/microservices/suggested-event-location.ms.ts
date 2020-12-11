import {
    Tables,
    DbSuggestedEventLocationsTable,
} from '../mappers/tables.mapper';
import { DbConnector } from '../connector.database';
import { ISuggestEventLocation } from '../../interfaces/event.interface';
import { TimeService } from '../../services/time';
import { LogService } from '../../services/log.service';

const Logger = new LogService('suggested-event-location.microservice');

export namespace SuggestedEventLocationMicroservice {
    export const UserHasSuggestedWithinMinutes = (
        userId: number,
        minutes: number,
    ) => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `SELECT * FROM ${Tables.SuggestedEventLocations} 
                WHERE date_created >= NOW() - INTERVAL ${minutes} MINUTE AND user_id = ${userId}`,
                (err: any, rows: any) => {
                    if (err) {
                        Logger.Log(`code: ${err.code} `, 3);
                        resolve(false);
                    } else {
                        resolve(rows && rows.length > 0 ? true : false);
                    }
                },
            );
        });
    };

    export const AddSuggestion = async (
        event: ISuggestEventLocation,
    ): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `INSERT INTO ${Tables.SuggestedEventLocations} 
            (user_id, event_id, gps_lat, gps_lng, gps_radius, date_created)
            VALUES 
            (${event.userId},'${event.eventId}', '${
                    event.location.gps.lat
                }', '${event.location.gps.lng}', '${
                    event.location.radius
                }', '${TimeService.DateTime()}')
            `,
                (err: any) => {
                    if (err) {
                        Logger.Log(`code: ${err.code} `, 3, event.userId);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                },
            );
        });
    };

    export const DeleteSuggestion = (id: number) => {
        return new Promise((resolve) => {
            DbConnector.Connection.query(
                `DELETE FROM ${Tables.SuggestedEventLocations} WHERE id = ${id}`,
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

    export const GetSuggestions = (
        eventId: number,
    ): Promise<DbSuggestedEventLocationsTable[] | null> => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `SELECT * FROM ${Tables.SuggestedEventLocations} WHERE event_id = ${eventId}`,
                (err: any, rows: any) => {
                    if (err) {
                        Logger.Log(`code: ${err.code} `, 3);
                        resolve(null);
                    } else {
                        resolve(rows);
                    }
                },
            );
        });
    };
}
