import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import eventRoutes from './routes/events.route';
import signalRoutes from './routes/signals.route';
import userRoutes from './routes/users.route';
import notificationRoutes from './routes/notifications.route';
import latestCrimesRoutes from './routes/notifications.route';
import { Settings } from './settings/settings';
import { SignalsCron } from './cron/signals.cron';
import { EventsCron } from './cron/events.cron';

const app = express();
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
);
app.options('*', cors());
app.use(cors({ credentials: false, origin: true }));

app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(
        'Access-Control-Allow-Methods',
        'PUT, GET, POST, DELETE, OPTIONS',
    );
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

const port = Settings.env.port || process.env.PORT;

app.use(
    eventRoutes,
    signalRoutes,
    userRoutes,
    notificationRoutes,
    latestCrimesRoutes,
);

app.listen(port, () => {
    console.log(`Running Cue at PORT: ${port} ENV: ${Settings.env.name}`);
});

// Activate CRON
SignalsCron();
EventsCron();

export default app;
