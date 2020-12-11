import { IPosition } from './position.interface';

export interface IUser {
    id: number;
    device_os: string;
    device_token: string;
    premium: boolean;
    created: Date;
    position?: IPosition;
    karma: number;
}
