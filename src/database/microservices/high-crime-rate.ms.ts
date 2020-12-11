import { DbHighCrimerateTable, Tables } from '../mappers/tables.mapper';
import { DbConnector } from '../connector.database';
import { LogService } from '../../services/log.service';

import { IHighCrime } from '../../interfaces/crime.interface';
import { TimeService } from '../../services/time';
const Logger = new LogService('high-crime-rate.microservice');

export namespace HighCrimerateMicroservice {
    export const GetRecentCrimeRates = (
        minutes: number,
        eventType?: number,
    ): Promise<DbHighCrimerateTable[]> => {
        let eventTypeStr = '';
        if (eventType) {
        }
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `SELECT * FROM ${
                    Tables.HighCrimerate
                } WHERE updated >= NOW() - INTERVAL ${minutes} MINUTE ${
                    eventType ? `AND event_type = ${eventType}` : ''
                }`,
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

    export const AddCrime = (item: IHighCrime) => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `INSERT INTO ${Tables.HighCrimerate} 
                (lat, lng, city, radius, event_type, created, updated, event_ids, event_latlngs, events_time_within_minutes)
                VALUES
                (${item.position.gps.lat},
                 ${item.position.gps.lng}, 
                 '${item.position.city}',
                 ${item.position.radius}, 
                 ${item.eventType},
                '${TimeService.DateTime()}', 
                '${TimeService.DateTime()}',
                '${JSON.stringify(item.eventIds)}',
                '${JSON.stringify(item.eventLocations)}',
                ${item.eventsIsWithinMinutes})`,
                (err: any) => {
                    if (err) {
                        Logger.Log(`code: ${err.code} `, 3);
                        reject(false);
                    } else {
                        resolve(true);
                    }
                },
            );
        });
    };

    export const RemoveUnusedCrimes = () => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `DELETE FROM ${Tables.HighCrimerate} WHERE radius = 0 AND updated <= NOW() - INTERVAL 2000 MINUTE`,
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

    export const UpdateCrime = (item: IHighCrime): Promise<boolean> => {
        if (!item.id) Promise.reject('Missing id');

        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `UPDATE ${Tables.HighCrimerate} 
                SET 
                lat = ${item.position.gps.lat}, 
                lng = ${item.position.gps.lng}, 
                radius = ${item.position.radius}, 
                updated = '${TimeService.DateTime()}',
                event_ids = '${JSON.stringify(item.eventIds)}',
                event_latlngs = '${JSON.stringify(item.eventLocations)}',
                events_time_within_minutes = ${item.eventsIsWithinMinutes}
                WHERE id = ${item.id}`,
                (err: any) => {
                    if (err) {
                        Logger.Log(`code: ${err.code} `, 3);
                        reject(false);
                    } else {
                        resolve(true);
                    }
                },
            );
        });
    };
}
