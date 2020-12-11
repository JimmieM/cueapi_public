import { DbConnector } from '../connector.database';
import { Tables } from '../mappers/tables.mapper';
import { LogService } from '../../services/log.service';
import { TimeService } from '../../services/time';

export namespace GeolocationRequestsMicroservice {
    export const AddCityAndStreetRequest = (
        status: string,
        userId: number,
        message?: string,
    ): Promise<boolean> => {
        return new Promise((resolve) => {
            DbConnector.Connection.query(
                `INSERT INTO ${Tables.ReportedBugs} 
                (request_type, status, user_id, message)
                VALUES
                ('location', '${status}', ${userId}, ${
                    message ? message : null
                })`,
                (err: any) => {
                    if (err) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                },
            );
        });
    };

    export const AddLatLngRequest = (
        status: string,
        eventId: number,
        message?: string,
    ): Promise<boolean> => {
        return new Promise((resolve) => {
            DbConnector.Connection.query(
                `INSERT INTO ${Tables.ReportedBugs} 
                (request_type, status, event_id, message)
                VALUES
                ('latlng', '${status}', ${eventId}, ${
                    message ? message : null
                })`,
                (err: any) => {
                    if (err) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                },
            );
        });
    };
}
