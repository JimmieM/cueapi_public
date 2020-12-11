export type ErrorMessage =
    | 'ERR_LIMIT_REACHED'
    | 'ER_MISSING_PARAMS'
    | 'ERR_INTERNAL_ERROR';

export interface IServerReply {
    success: boolean;
    errorMessage?: ErrorMessage;
    data?: any;
}
