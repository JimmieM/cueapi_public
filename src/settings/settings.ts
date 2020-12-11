import { ISettings } from 'src/interfaces/settings.interface';
const env = require('../../environments.json');
export const Settings = env[process.env.NODE_ENV || 'dev'] as ISettings;
