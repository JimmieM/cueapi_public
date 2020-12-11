import { UsersMicroservice } from '../database/microservices/users.ms';
import { UsersFactory } from '../database/factories/users.factory';
import { IUser } from '../interfaces/user.interface';
import { IPosition } from '../interfaces/position.interface';
import { Position } from '../services/position.service';

export namespace UsersGateway {
    export const UpdateDeviceToken = async (
        userId: number,
        deviceToken: string,
    ) => {
        return await UsersMicroservice.UpdateDeviceToken(userId, deviceToken);
    };

    export const WhoAmI = async (
        deviceOS: string,
        deviceToken: string,
        position: IPosition,
    ): Promise<IUser> => {
        const user = await UsersMicroservice.GetUserByDeviceToken(deviceToken);

        if (!user) {
            const createUser = await UsersMicroservice.CreateUser(
                deviceOS,
                deviceToken,
            );
            if (createUser) {
                const getCreatedUser = await UsersMicroservice.GetUserByDeviceToken(
                    deviceToken,
                );

                if (getCreatedUser) {
                    return {
                        ...UsersFactory.User(getCreatedUser),
                        position: await Position.UpdateUserLocationIfNeeded(
                            position,
                        ),
                    };
                }
                return null;
            }
            return null;
        }
        return {
            ...UsersFactory.User(user),
            position: await Position.UpdateUserLocationIfNeeded(position),
        };
    };
}
