import { DbConnector } from '../connector.database';
import { Tables, DbEventsTable } from '../mappers/tables.mapper';
import { IEvent, locationGPSType } from '../../interfaces/event.interface';
import { ILatLng } from '../../interfaces/position.interface';
import { LogService } from '../../services/log.service';

const Logger = new LogService('events.microservice');

export namespace EventsMicroservice {
    export const GetEventById = (
        id: number,
        type: string,
    ): Promise<DbEventsTable> => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `SELECT * FROM ${Tables.Events} WHERE id = '${id}' AND type = '${type}'`,
                (err: any, rows: any) => {
                    if (err) {
                        Logger.Log(`code: ${err.code} `, 3);
                    }
                    if (!rows || rows.length === 0) {
                        Logger.Log('GetEventById returned Null on ' + id, 1);
                        resolve(null);
                    } else {
                        resolve(rows[0]);
                    }
                },
            );
        });
    };

    export const GetEvent = async (
        eventId: number,
    ): Promise<DbEventsTable | null> => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `SELECT * FROM ${Tables.Events} WHERE id = ${eventId}`,
                (err: any, rows) => {
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

    export const UpdateEvent = async (event: IEvent): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `UPDATE 
                ${Tables.Events} 
                SET 
                updated = '${event.updated.toString().substr(0, 19)}', 
                summary = '${event.summary}',
                initial_locationgps = '${event.initial_latlng.lat},${
                    event.initial_latlng.lng
                }',
                locationgps = '${event.location.gps.lat},${
                    event.location.gps.lng
                }',
                locationname = '${event.location.city}'
                WHERE id = ${event.id}`,
                (err: any) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(true);
                    }
                },
            );
        });
    };

    export const AddAuthorizedEvent = async (
        event: IEvent,
    ): Promise<boolean> => {
        const exists = await GetEventById(event.id, event.type);
        if (exists) return false;

        return new Promise((resolve) => {
            DbConnector.Connection.query(
                `INSERT INTO ${Tables.Events} 
            (id, datetime, updated, name, summary, url, type, locationname, locationgps, locationgps_type, archived, fetched, initial_locationgps, custom_locationradius, keywords)
            VALUES 
            (${event.id}, '${event.datetime
                    .toString()
                    .substr(0, 19)}','${event.datetime
                    .toString()
                    .substr(0, 19)}', '${event.name}', '${event.summary}', '${
                    event.url
                }', '${event.type}', '${event.location.city}', '${
                    event.location.gps.lat
                },${event.location.gps.lng}', '${event.LocationGPSType}', ${
                    event.archived
                }, '${event.fetched}', '${
                    event.initial_latlng
                        ? `${event.initial_latlng.lat},${event.initial_latlng.lng}`
                        : null
                }', ${event.location.radius || null}, ${
                    event.keywords
                        ? `'${JSON.stringify(event.keywords)}'`
                        : null
                })
            `,
                (err: any) => {
                    if (err) {
                        Logger.Log(
                            `failed inserting event: ${event.id} code: ${err.code} `,
                            3,
                        );
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                },
            );
        });
    };

    export const GetEventsInCity = (
        minutes: number,
        cities: string[],
    ): Promise<DbEventsTable[] | null> => {
        let citiesString = '';
        if (cities.length > 0) {
            citiesString =
                "AND locationname IN ('" +
                cities.filter((el) => el != null).join("','") +
                "')";
        }
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `SELECT * FROM ${Tables.Events} WHERE datetime >= NOW() - INTERVAL ${minutes} MINUTE AND archived = 0 ${citiesString} ORDER BY datetime DESC`,
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

    export const UpdateGPS = (
        eventId: number,
        gps: ILatLng,
        type: locationGPSType,
    ): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `UPDATE ${Tables.Events} SET locationgps_type = '${type}' locationgps = '${gps.lat}, ${gps.lng}' WHERE id = ${eventId}`,
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

    export const GetRecentEvents = (
        minutes: number,
        eventTypes?: string[],
        cities?: string[],
    ): Promise<DbEventsTable[] | null> => {
        return new Promise((resolve, reject) => {
            let type = '';
            if (eventTypes) {
                type = "AND type IN ('" + eventTypes.join("','") + "')";
            }
            let citiesString = '';
            if (cities.length > 0) {
                citiesString =
                    "AND locationname IN ('" + cities.join("','") + "')";
            }

            DbConnector.Connection.query(
                `SELECT * FROM ${Tables.Events} WHERE datetime >= NOW() - INTERVAL ${minutes} MINUTE AND archived = 0 ${type} ${citiesString} ORDER BY datetime DESC`,
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

    export const GetEvents = (): Promise<DbEventsTable[]> => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `SELECT * FROM ${Tables.Events} WHERE archived = 0 ORDER BY datetime DESC`,
                (err: any, rows: any) => {
                    if (!rows) {
                        reject(new Error('Error rows is undefined'));
                    } else {
                        resolve(rows);
                    }
                },
            );
        });
    };
}
