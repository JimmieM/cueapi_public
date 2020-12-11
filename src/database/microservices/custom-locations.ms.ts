import { DbConnector } from '../connector.database';
import { Tables, DbCustomLocationsTable } from '../mappers/tables.mapper';
import { ILatLng } from '../../interfaces/position.interface';
import { TimeService } from '../../services/time';
import { LogService } from '../../services/log.service';

const Logger = new LogService('custom-locations.microservice');

export namespace CustomLocationsMicroservice {
    export const AddCustomLocation = async (
        streetname: string,
        city: string,
        latLng: ILatLng,
        cityBlock?: string,
        streetnumber?: number,
    ) => {
        const verification = 'google';
        const exists = await GetCustomLocation(
            streetname,
            city,
            cityBlock,
            streetnumber,
        );
        if (exists) return Promise.resolve(false);
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO custom_locations
            (city, city_block, streetname, streetnumber, gps_lat, gps_lng, date_created, verification)
            VALUES
            ('${city}', '${cityBlock ? cityBlock : ''}','${streetname}', ${
                streetnumber === undefined ? null : streetnumber
            }, '${latLng.lat}', '${
                latLng.lng
            }', '${TimeService.DateTime()}', '${verification}')`;
            DbConnector.Connection.query(query, (err: any, rows: any) => {
                if (err) {
                    Logger.Log(`Failed to Add. code: ${err.code} `, 3);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    };

    export const GetCustomLocation = (
        streetname: string,

        city: string,
        cityBlock?: string,
        streetnumber?: number,
    ): Promise<DbCustomLocationsTable> => {
        return new Promise((resolve, reject) => {
            let nrString = '';
            let cityBlockString = '';
            if (cityBlock) {
                cityBlockString = ` AND city_block = '${cityBlock}'`;
            }
            if (streetnumber) {
                nrString = `AND streetnumber = ${streetnumber}`;
            }
            DbConnector.Connection.query(
                `SELECT * FROM ${Tables.CustomLocations} WHERE ${
                    streetname !== '' ? `streetname = '${streetname}' AND` : ''
                } city = '${city}' ${nrString} ${cityBlockString}`,
                (err: any, rows: any) => {
                    if (err) {
                        Logger.Log(`Failed to get. code: ${err.code} `, 3);
                        resolve(null);
                    } else {
                        resolve(rows ? rows[0] : null);
                    }
                },
            );
        });
    };
}
