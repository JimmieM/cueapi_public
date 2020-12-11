import express from 'express';
import { NotificationsGateway } from '../gateways/notifications.gateway';
import { IServerReply } from '../interfaces/serverreply.interface';
import { Settings } from '../settings/settings';

const router = express.Router();
const prefix = '/' + Settings.env.name;

/// Get latest notifications
router.post(prefix + '/notifications/latest', async (req: any, res: any) => {
    const { userId } = req.body;
    if (!userId) {
        res.status(500).send({
            success: false,
            errorMessage: 'ER_MISSING_PARAMS',
        } as IServerReply);
    }
    const notifications = await NotificationsGateway.GetRecentNotificationsByUserId(
        userId,
        12000,
    );
    if (notifications && notifications.length > 0) {
        res.status(200).send({
            success: true,
            data: notifications,
        });
    } else {
        res.status(500).send({
            success: false,
            errorMessage: 'ERR_INTERNAL_ERROR',
        } as IServerReply);
    }
});

export default router;
