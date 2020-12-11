import { DbConnector } from '../connector.database';
import { Tables } from '../mappers/tables.mapper';
import { LogService } from '../../services/log.service';
import { TimeService } from '../../services/time';

const Logger = new LogService('bug-reports.microservice');

export namespace BugReportsMicroservice {
    export const ReportBug = (desc: string): Promise<boolean> => {
        return new Promise((resolve) => {
            DbConnector.Connection.query(
                `INSERT INTO ${Tables.ReportedBugs} 
                (description, datetime)
                VALUES
                ('${desc}', '${TimeService.DateTime()}')`,
                (err: any) => {
                    if (err) {
                        Logger.Log(`code: ${err.code} `, 3);
                        resolve(false);
                    }
                    resolve(true);
                },
            );
        });
    };
}
