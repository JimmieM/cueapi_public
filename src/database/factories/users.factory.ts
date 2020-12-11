import { DbUsersTable } from '../mappers/tables.mapper';
import { IUser } from '../../interfaces/user.interface';

export namespace UsersFactory {
    export const User = (user: DbUsersTable): IUser | null => {
        if (!user) {
            return null;
        }
        return {
            id: user.id,
            device_os: user.device_os,
            device_token: user.device_token,
            premium: user.premium === 1 ? true : false,
            created: new Date(user.created),
            karma: user.karma,
        };
    };
}
