import cron from 'node-cron';
import { HighCrimerateMicroservice } from '../database/microservices/high-crime-rate.ms';

export const CrimesCron = () => {
    const task = cron.schedule('30 2 * * *', async () => {
        await HighCrimerateMicroservice.RemoveUnusedCrimes();
    });

    task.start();
};
