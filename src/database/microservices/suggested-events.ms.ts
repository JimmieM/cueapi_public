import {
    DbSuggestedEventsTable,
    Tables,
    DbSuggestedEventLocationsTable,
} from '../mappers/tables.mapper';
import { DbConnector } from '../connector.database';
import {
    ICreateSuggestedEvent,
    IEvent,
} from '../../interfaces/event.interface';
import { TimeService } from '../../services/time';
import { GetEventIconTypeByName } from '../../models/events-types.model';
import { LogService } from '../../services/log.service';

const Logger = new LogService('suggested-events.microservice');

export namespace SuggestedEventsMicroservice {
    export const UserHasSuggestedWithinMinutes = (
        userId: number,
        minutes: number,
    ) => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `SELECT * FROM ${Tables.SuggestedEvents} 
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

    export const GetSimiliarEvents = (
        event: IEvent,
    ): Promise<DbSuggestedEventLocationsTable[] | null> => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `SELECT * FROM ${Tables.SuggestedEvents} WHERE 
                (street = '%${
                    event.location.streetname
                }%' AND type = ${GetEventIconTypeByName(
                    event.type,
                )} AND city = '${event.location.city}')
                OR
                (AND type = ${GetEventIconTypeByName(event.type)} AND city = '${
                    event.location.city
                }')`,
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

    export const AddSuggestedEvent = async (
        event: ICreateSuggestedEvent,
    ): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `INSERT INTO ${Tables.SuggestedEvents} 
            (type, city, street, gps_lat, gps_lng, user_id, approves, created, description, updated)
            VALUES 
            (${event.type},'${event.location.city}', '${
                    event.location.streetname
                }', '${event.location.gps.lat}', '${
                    event.location.gps.lng
                }', '${event.userId}', 0,'${TimeService.DateTime()}', '${
                    event.description
                }', '${TimeService.DateTime()}')
            `,
                (err: any) => {
                    if (err) {
                        Logger.Log(
                            `failed to create suggested events: ${JSON.stringify(
                                event,
                            )} code: ${err.code} `,
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

    export const SetLocatedEventId = (
        suggestedEventId: number,
    ): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `UPDATE ${
                    Tables.SuggestedEvents
                } SET located_event_id = 1, updated = '${TimeService.DateTime()}' WHERE id = ${suggestedEventId} `,
                (err: any, rows: any) => {
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

    export const SetArchived = (suggestedEventId: number): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `UPDATE ${
                    Tables.SuggestedEvents
                } SET archived = 1, updated = '${TimeService.DateTime()}' WHERE id = ${suggestedEventId}`,
                (err: any, rows: any) => {
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

    export const Upvote = (suggestedEventId: number): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `UPDATE ${
                    Tables.SuggestedEvents
                } SET approves = approves + 1, updated = '${TimeService.DateTime()}' WHERE id = ${suggestedEventId}`,
                (err: any, rows: any) => {
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

    export const GetByLocatedEventId = (
        eventId: number,
    ): Promise<DbSuggestedEventsTable[]> => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `SELECT * FROM ${Tables.SuggestedEvents} 
                WHERE located_event_id = ${eventId}`,
                (err: any, rows: any) => {
                    if (err) {
                        Logger.Log(`code: ${err.code} `, 3);
                    }
                    if (!rows) {
                        resolve(null);
                    } else {
                        resolve(rows);
                    }
                },
            );
        });
    };

    export const GetRecentSuggestedEvents = (
        minutes: number,
        eventTypes?: string[],
        cities?: string[],
        onlyUnlocated = false,
    ): Promise<DbSuggestedEventsTable[]> => {
        return new Promise((resolve, reject) => {
            let type = '';
            if (eventTypes) {
                type = " AND type IN ('" + eventTypes.join("','") + "')";
            }
            let citiesString = '';
            if (cities) {
                citiesString = " AND city IN ('" + cities.join("','") + "')";
            }
            DbConnector.Connection.query(
                `SELECT * FROM ${Tables.SuggestedEvents} 
                WHERE 
                updated >= NOW() - INTERVAL ${minutes} MINUTE 
                ${onlyUnlocated ? ' AND located_event_id = NULL' : ''}
                ${type} 
                ${citiesString}
                ORDER BY updated DESC`,
                (err: any, rows: any) => {
                    if (err) {
                        Logger.Log(`code: ${err.code} `, 3);
                    }
                    if (!rows) {
                        resolve(null);
                    } else {
                        resolve(rows);
                    }
                },
            );
        });
    };
}
