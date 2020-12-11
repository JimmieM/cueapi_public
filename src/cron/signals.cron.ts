import { SignalerService } from '../services/signaler.service';
import cron from 'node-cron';

export const SignalsCron = () => {
    const Refresh = async () => {
        const signals = await SignalerService.TriggerSignalsRefresh(150);

        for (const match of signals) {
            await SignalerService.SignalUser(match);
        }
    };

    const task = cron.schedule('*/3 * * * *', () => {
        Refresh();
    });
    Refresh();
    task.start();
};
