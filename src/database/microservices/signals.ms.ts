import { ICreateSignal } from '../../interfaces/signal.interface';
import { DbConnector } from '../connector.database';
import { Tables, DbSignalsTable } from '../mappers/tables.mapper';
import { LogService } from '../../services/log.service';

const Logger = new LogService('signals.microservice');

export namespace SignalsMicroservice {
    export const DeleteSignal = (id: number): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `DELETE FROM ${Tables.Signals} WHERE id = ${id}`,
                (err: any) => {
                    if (err) {
                        Logger.Log(`code: ${err.code} `, 3);
                        reject(err);
                    } else {
                        resolve(true);
                    }
                },
            );
        });
    };

    export const UpdateSignal = (item: ICreateSignal): Promise<boolean> => {
        if (!item.id) {
            return Promise.resolve(false);
        }
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `UPDATE ${Tables.Signals} 
                SET 
                position_lng='${item.position.gps.lng}', 
                position_lat='${item.position.gps.lat}', 
                position_city='${item.city}', 
                position_streetname='${item.streetname}', 
                name='${item.name}', 
                position_radius='${item.position.radius}', 
                keywords='${JSON.stringify(item.keywords)}',
                position_county='${item.county}'
                WHERE id=${item.id},
                `,
                (err: any) => {
                    if (err) {
                        Logger.Log(`code: ${err.code} `, 3, item.userId);
                        reject(err);
                    } else {
                        resolve(true);
                    }
                },
            );
        });
    };

    export const AddSignal = (item: ICreateSignal): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `INSERT INTO ${Tables.Signals} 
                (user_id, position_lng, position_lat, position_city, position_streetname, duration_minutes, name, event_type, position_radius, date_created, notified, keywords, strict_keywords, listener_type, position_county)
                 VALUES
                ('${item.userId}', '${item.position.gps.lng}', '${
                    item.position.gps.lat
                }', '${item.city}', '${item.streetname || ''}', '2000', '${
                    item.name
                }', '${JSON.stringify(item.eventType)}', '${
                    item.position.radius
                }', '${new Date()
                    .toISOString()
                    .slice(0, 19)
                    .replace('T', ' ')}', 0, '${JSON.stringify(
                    item.keywords,
                )}', '${item.strictKeywords ? 1 : 0}', '${item.listenerType}',
                '${item.county ? item.county : null}')`,
                (err: any) => {
                    if (err) {
                        Logger.Log(`code: ${err.code} `, 3, item.userId);
                        reject(err);
                    } else {
                        resolve(true);
                    }
                },
            );
        });
    };

    export const GetAllSignals = (): Promise<DbSignalsTable[] | null> => {
        return new Promise((resolve) => {
            DbConnector.Connection.query(
                `SELECT * FROM ${Tables.Signals}`,
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

    export const GetSignals = (
        userId: number,
    ): Promise<DbSignalsTable[] | null> => {
        return new Promise((resolve) => {
            DbConnector.Connection.query(
                `SELECT * FROM ${Tables.Signals} WHERE user_id = ${userId}`,
                (err: any, rows: any) => {
                    if (err) {
                        Logger.Log(`code: ${err.code} `, 3, userId);
                        resolve(null);
                    } else {
                        resolve(rows);
                    }
                },
            );
        });
    };
}
