import { HighCrimerateMicroservice } from '../database/microservices/high-crime-rate.ms';
import { HighCrimeRateFactory } from '../database/factories/high-crime-rate.factory';
import { IHighCrime } from '../interfaces/crime.interface';

export namespace CrimeRateGateway {
    export const GetRecentCrimeLocation = async (): Promise<IHighCrime[]> => {
        const getRecentCrimeLocations = await HighCrimerateMicroservice.GetRecentCrimeRates(
            2300,
        );
        if (getRecentCrimeLocations && getRecentCrimeLocations.length > 0) {
            const crimes = HighCrimeRateFactory.HighCrimeRates(
                getRecentCrimeLocations,
            );
            return crimes.filter((c) => c.eventIds.length > 6);
        }
        return [];
    };
}
