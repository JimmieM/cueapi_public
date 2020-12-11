import { DbConnector } from '../connector.database';
import { Tables, DbCustomLocationsTable } from '../mappers/tables.mapper';
import { LogService } from '../../services/log.service';

const Logger = new LogService('blacklisted-locations.microservice');

export namespace BlacklistedLocationsMicroservice {
    export const AddBlacklistedLocation = (
        streetname: string,
        city: string,
    ) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO ${Tables.BlacklistedLocations} 
            (streetname, city)
            VALUES 
            ('${streetname}', '${city}')`;
            DbConnector.Connection.query(query, (err: any) => {
                if (err) {
                    Logger.Log(`code: ${err.code} `, 3);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    };

    export const GetBlacklistedLocation = (
        streetname: string,
        city: string,
    ): Promise<DbCustomLocationsTable> => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `SELECT * FROM ${Tables.BlacklistedLocations} WHERE streetname = '${streetname}' AND city = '${city}'`,
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
}
