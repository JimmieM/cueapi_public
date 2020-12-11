export interface ISettings {
    db: {
        host: string;
        password: string;
        user: string;
        database: string;
        port: number;
    };
    env: {
        port: number;
        name: 'dev' | 'test' | 'prod' | 'stage';
    };
}
