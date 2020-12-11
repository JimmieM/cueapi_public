let user: any = null;
export class UserPortal {
    static GetUser = () => {
        return user;
    };

    static SignOff = () => {
        user = null;
    };

    static RefreshToken = () => {};

    constructor(userId: number) {
        if (userId === null) {
            throw new Error('There is no current user');
        }
    }
}
