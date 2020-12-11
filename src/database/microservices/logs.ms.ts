import { DbConnector } from '../connector.database';
import { Tables } from '../mappers/tables.mapper';
import { TimeService } from '../../services/time';

export namespace LogsMicroservice {
    export const Add = (
        msg: string,
        namespace: string,
        level: number,
        userId?: number,
    ) => {
        return new Promise((resolve, reject) => {
            DbConnector.Connection.query(
                `INSERT INTO ${Tables.Logs} 
                (error_message, namespace, datetime, user_id, level)
                VALUES 
                ('${msg}', '${namespace}', '${TimeService.DateTime()}', ${
                    userId !== undefined ? userId : null
                }, ${level})`,
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
