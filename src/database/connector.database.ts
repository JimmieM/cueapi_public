import mysql from 'mysql';
import { Settings } from '../settings/settings';

export class DbConnector {
    public static get Connection() {
        return this._connection || (this._connection = this.GetConnection());
    }

    private static _connection: mysql.Connection;

    private static GetConnection = () => {
        const conn = mysql.createConnection({
            host: Settings.db.host,
            password: Settings.db.password,
            user: Settings.db.user,
            database: Settings.db.database,
            port: Settings.db.port,
        });

        conn.connect((err: Error) => {
            if (err) {
                throw new Error('Failed to connect to DB');
            }
        });
        return conn;
    };
}
