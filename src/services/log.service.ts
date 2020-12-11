import { LogsMicroservice } from '../database/microservices/logs.ms';

// 1 == low
// 2 == medium
// 3 == high
// 4 == severe
export type LogLevel = 1 | 2 | 3 | 4;

export class LogService {
    private namespace: string;
    constructor(_namespace: string) {
        this.namespace = _namespace;
    }

    Log(msg: string, level: LogLevel, userId?: number) {
        console.warn(msg, level, userId);
        LogsMicroservice.Add(msg, this.namespace, level, userId);
    }
}
