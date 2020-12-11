import { Router } from 'express';
import { UserPortal } from '../portals/user.portal';

const domain = `/`;

export interface ParsedBody {
    body: any;
    res: any;
}

type Output = ParsedBody;

interface IEndpoint {
    path: string;
    method: string;
    body: {
        key: string;
        type: any;
        defaultValue?: any;
        value?: string;
    }[];
}

export const Ok = (reply: any) => {
    MiddlewareRouter.res.status(200).send(reply);
};

export const Deny = (err: any) => {
    MiddlewareRouter.res.status(500).send(err);
};

export const registerRoute = (
    router: Router,
    endpoint: IEndpoint,
    success: (output: Output) => void,
) => {
    if (endpoint.method === 'GET') {
        router.get(
            domain + endpoint.path,
            (req: any, res: any) =>
                MiddlewareRouter.Attach(req, res, endpoint.body),
            (output: Output) => {
                success(output);
            },
        );
    }
};

export class MiddlewareRouter {
    static res: any;

    static ValidateParams = (
        body: ParsedBody,
        requiredParams: {
            key: string;
            type: any;
            defaultValue?: string;
            value?: string;
        }[],
    ): boolean => {
        const missingParams: any[] = [];
        requiredParams.map((param) => {
            if (!body.body[param.key]) {
                missingParams.push({ key: param.key });
            }
        });
        if (missingParams.length > 0)
            throw new Error(JSON.stringify(missingParams));
        return true;
    };

    static Attach = (
        req: any,
        res: any,
        requiredParams: {
            key: string;
            type: any;
            defaultValue?: string;
            value?: string;
        }[],
    ): ParsedBody => {
        const body = req.body; // handle json
        MiddlewareRouter.res = res;
        const userId = body.userId || 1;
        const x = new UserPortal(userId);

        const validate = MiddlewareRouter.ValidateParams(body, requiredParams);
        if (validate) return { body, res };
    };
}
