import express from 'express';
import { CrimeRateGateway } from '../gateways/crime-rate.gateway';
import { Settings } from '../settings/settings';

const router = express.Router();
const prefix = '/' + Settings.env.name;

/// Get latest crime locations
router.get(prefix + '/crime-locations/latest', async (req: any, res: any) => {
    const crimeLocations = await CrimeRateGateway.GetRecentCrimeLocation();
    if (crimeLocations && crimeLocations.length > 0) {
        res.status(200).send(crimeLocations);
    } else {
        res.status(500).send([]);
    }
});

export default router;
