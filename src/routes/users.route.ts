import express from 'express';
import { UsersGateway } from '../gateways/users.gateway';
import { BugReportsMicroservice } from '../database/microservices/bug-reports.ms';
import { IServerReply } from '../interfaces/serverreply.interface';
import { Settings } from '../settings/settings';

const router = express.Router();

const prefix = '/' + Settings.env.name;

// Set device token
router.post(prefix + '/user/devicetoken', async (req: any, res: any) => {
    const { userId, deviceToken } = req.body;

    if (!deviceToken) {
        res.status(500).send({
            success: false,
            errorMessage: 'ER_MISSING_PARAMS',
        } as IServerReply);
    } else {
        const resp = await UsersGateway.UpdateDeviceToken(userId, deviceToken);
        res.status(200).send(resp);
    }
});

// Get user
router.post(prefix + '/user/whoami', async (req: any, res: any) => {
    const { deviceToken, deviceOS, position } = req.body;
    if (deviceToken && deviceOS && position) {
        const resp = await UsersGateway.WhoAmI(deviceOS, deviceToken, position);
        res.status(200).send({
            success: true,
            data: resp,
        });
    } else {
        res.status(500).send({
            success: false,
            errorMessage: 'ER_MISSING_PARAMS',
        } as IServerReply);
    }
});

// Report a bug
router.post(prefix + '/user/report-bug', async (req: any, res: any) => {
    const { description } = req.body;
    if (description) {
        const resp = await BugReportsMicroservice.ReportBug(description);
        res.status(200).send({
            success: resp,
        } as IServerReply);
    } else {
        res.status(500).send({
            success: false,
            errorMessage: 'ER_MISSING_PARAMS',
        } as IServerReply);
    }
});

export default router;
