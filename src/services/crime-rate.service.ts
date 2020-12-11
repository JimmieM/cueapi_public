import { IEvent } from '../interfaces/event.interface';
import { HighCrimerateMicroservice } from '../database/microservices/high-crime-rate.ms';
import { EventTypes } from '../models/events-types.model';
import { CoordsHelper } from '../helpers/coords.helper';
import { EventsGateway } from '../gateways/events.gateway';
import { HighCrimeRateFactory } from '../database/factories/high-crime-rate.factory';
import { IHighCrime } from '../interfaces/crime.interface';

export namespace CrimerateService {
    export const CheckLatestEvents = async () => {
        const events = await EventsGateway.FetchRecentEvents(60);
        if (!events || events.length === 0) return;
    };

    export const RegisterEvent = async (event: IEvent): Promise<boolean> => {
        // get the event type as number
        const eventType = EventTypes.find((e) => e.names.includes(event.type));
        if (!eventType) return false;

        const getSimiliarCrimes = await HighCrimerateMicroservice.GetRecentCrimeRates(
            120,
            eventType.id,
        );
        // ff there is any similiar crimes to this event
        if (getSimiliarCrimes && getSimiliarCrimes.length > 0) {
            const crimes = HighCrimeRateFactory.HighCrimeRates(
                getSimiliarCrimes,
            );

            // check each high-crime
            crimes.forEach(async (crime) => {
                if (crime.position.city !== event.location.city) return;
                const meters = CoordsHelper.GetMeters(
                    event.location.gps.lat,
                    event.location.gps.lng,
                    crime.position.gps.lat,
                    crime.position.gps.lng,
                );
                // if the high-crime spot is less than 1000m away
                if (meters < 1000) {
                    // if the supposedly highcrime has more than 3 events
                    if (crime.eventLocations.length > 3) {
                        const updateCrime = await UpdateHighCrimeRateRecord(
                            crime,
                            event,
                        );
                    }
                }
            });
        }
        // Create the crime, then next time the same type will get a match.
        const createCrime = await CreateHighCrimeRateRecord({
            id: event.id,
            position: {
                ...event.location,
            },
            eventType: eventType.id,
            eventIds: [event.id],
            eventLocations: [event.location.gps],
            eventsIsWithinMinutes: 0,
        });
    };

    const UpdateHighCrimeRateRecord = async (
        crime: IHighCrime,
        event: IEvent,
    ) => {
        // locate the new center, with the matched event.
        const eventLocations = [...crime.eventLocations, event.location.gps];
        const eventIds = [...crime.eventIds, event.id];
        const newCenter = CoordsHelper.GetCenter(eventLocations);

        let totalMeters = 0;
        eventLocations.forEach((c) => {
            totalMeters += CoordsHelper.GetMeters(
                c.lat,
                c.lng,
                newCenter.lat,
                newCenter.lng,
            );
        });
        const radius = totalMeters / eventLocations.length;

        return await HighCrimerateMicroservice.UpdateCrime({
            id: crime.id,
            position: {
                gps: {
                    ...newCenter,
                },
                city: crime.position.city,
                timestamp: crime.position.timestamp,
                radius,
            },
            eventType: crime.eventType,
            eventIds: eventIds,
            eventLocations: eventLocations,
            eventsIsWithinMinutes: 200,
        });
    };

    const CreateHighCrimeRateRecord = async (crime: IHighCrime) => {
        return await HighCrimerateMicroservice.AddCrime(crime);
    };
}
