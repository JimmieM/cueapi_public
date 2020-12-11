import express from 'express';
import { SignalsGateway } from '../gateways/signals.gateway';
import { SignalerService } from '../services/signaler.service';
import { IServerReply } from '../interfaces/serverreply.interface';
import { Settings } from '../settings/settings';

const router = express.Router();
const prefix = '/' + Settings.env.name;

/// TESTING ONLY
/// Get Latest Signals
router.get(prefix + '/latest', async (req: any, res: any) => {
    const x = await SignalerService.TriggerSignalsRefresh(30);
    res.status(200).send({
        success: true,
        data: x,
    });
});

/// Get Signals
router.post(prefix + '/signals', async (req: any, res: any) => {
    const { userId } = req.body;
    if (!userId) {
        res.status(500).send({
            success: false,
            errorMessage: 'ER_MISSING_PARAMS',
        } as IServerReply);
    } else {
        const data = await SignalsGateway.GetSignals(userId);
        res.status(200).send({
            success: data && data.length > 0,
            data,
        });
    }
});

/// Delete signal
router.post(prefix + '/signals/delete', async (req: any, res: any) => {
    const { userId } = req.body;
    if (!userId) {
        res.status(500).send({
            success: false,
            errorMessage: 'ER_MISSING_PARAMS',
        } as IServerReply);
    } else {
        const data = await SignalsGateway.DeleteSignal(req.body.signal.id);
        res.status(200).send({
            success: data,
        });
    }
});

/// Create signals
router.post(prefix + '/signals/create', async (req: any, res: any) => {
    const { userId } = req.body;
    if (!userId) {
        res.status(500).send({
            success: false,
            errorMessage: 'ER_MISSING_PARAMS',
        } as IServerReply);
    } else {
        const data = await SignalsGateway.CreateSignal(req.body.signal);
        res.status(200).send({
            success: data,
        } as IServerReply);
    }
});

/// Edit signals
router.post(prefix + '/signals/edit', async (req: any, res: any) => {
    const { userId, signal } = req.body;
    if (!userId || !signal) {
        res.status(500).send({
            success: false,
            errorMessage: 'ER_MISSING_PARAMS',
        } as IServerReply);
    } else {
        const data = await SignalsGateway.EditSignal(signal);
        res.status(200).send({
            success: data,
        } as IServerReply);
    }
});

export default router;
