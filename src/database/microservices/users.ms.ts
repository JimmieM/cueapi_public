import { DbConnector } from '../connector.database';
import { DbUsersTable, Tables } from '../mappers/tables.mapper';
import { LogService } from '../../services/log.service';
import { TimeService } from '../../services/time';

const Logger = new LogService('users.microservice');

export namespace UsersMicroservice {
    export const UpdateDeviceToken = async (
        userId: number,
        deviceToken: string,
    ): Promise<boolean> => {
        return new Promise((resolve) => {
            DbConnector.Connection.query(
                `UPDATE ${Tables.Users} SET device_token = '${deviceToken}' WHERE id = ${userId}`,
                (err: any) => {
                    if (err) {
                        Logger.Log(`code: ${err.code} `, 3, userId);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                },
            );
        });
    };

    export const NullDeviceToken = async (userId: number): Promise<boolean> => {
        return new Promise((resolve) => {
            DbConnector.Connection.query(
                `UPDATE ${Tables.Users} SET device_token = NULL WHERE id = ${userId}`,
                (err: any) => {
                    if (err) {
                        Logger.Log(`code: ${err.code} `, 3, userId);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                },
            );
        });
    };

    export const UpdateKarma = (userId: number, karma: number) => {
        return new Promise((resolve) => {
            DbConnector.Connection.query(
                `UPDATE ${Tables.Users} SET karma = karma + '${karma}' WHERE id = ${userId}`,
                (err: any) => {
                    if (err) {
                        Logger.Log(`code: ${err.code} `, 3, userId);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                },
            );
        });
    };

    export const CreateUser = (
        deviceOS: string,
        deviceToken: string,
    ): Promise<Boolean> => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `INSERT INTO ${
                    Tables.Users
                } (device_os, device_token, created) VALUES ('${deviceOS}', '${deviceToken}', '${TimeService.DateTime()}')`,
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

    export const GetUserByDeviceToken = (
        deviceToken: string,
    ): Promise<DbUsersTable | null> => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `SELECT * FROM ${Tables.Users} WHERE device_token = '${deviceToken}'`,
                (err: any, rows: any) => {
                    if (err) {
                        Logger.Log(`code: ${err.code} `, 3);
                        reject(err);
                    }
                    resolve(rows && rows.length > 0 ? rows[0] : null);
                },
            );
        });
    };

    export const GetUserByUserId = (id: number): Promise<DbUsersTable[]> => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `SELECT * FROM ${Tables.Users} WHERE id = ${id}`,
                (err: any, rows: any) => {
                    if (err) {
                        Logger.Log(`code: ${err.code} `, 3, id);
                        reject(null);
                    }
                    if (!rows) {
                        resolve([]);
                    } else {
                        resolve(rows);
                    }
                },
            );
        });
    };
}
