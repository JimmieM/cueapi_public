import cron from 'node-cron';
import { EventsService } from '../services/events.service';
import { Settings } from '../settings/settings';

export const EventsCron = async () => {
    const nMinutes =
        Settings.env.name === 'prod' || Settings.env.name === 'stage' ? 6 : 25;

    const task = cron.schedule(`*/${nMinutes} * * * *`, async () => {
        if (
            Settings.env.name === 'prod' ||
            Settings.env.name === 'test' ||
            Settings.env.name === 'stage'
        ) {
            const fetch = await EventsService.fetchEvents();
        } else {
            EventsService.localEvents();
        }
    });

    await task.start();
};

if (
    Settings.env.name === 'prod' ||
    Settings.env.name === 'test' ||
    Settings.env.name === 'stage'
) {
    EventsService.fetchEvents();
} else {
    EventsService.localEvents();
}
