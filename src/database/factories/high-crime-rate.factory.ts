import { DbHighCrimerateTable } from '../mappers/tables.mapper';
import { IHighCrime } from '../../interfaces/crime.interface';

export namespace HighCrimeRateFactory {
    export const HighCrimeRate = (item: DbHighCrimerateTable): IHighCrime => {
        return {
            id: item.id,
            position: {
                gps: {
                    lat: Number(item.lat),
                    lng: Number(item.lng),
                },
                city: item.city,
                radius: item.radius,
                timestamp: new Date(item.created).getTime(),
            },
            created: new Date(item.created),
            updated: new Date(item.updated),
            eventIds: JSON.parse(item.event_ids),
            eventLocations: JSON.parse(item.event_latlngs),
            eventsIsWithinMinutes: item.events_time_within_minutes,
            eventType: item.event_type,
        };
    };

    export const HighCrimeRates = (
        items: DbHighCrimerateTable[],
    ): IHighCrime[] => {
        if (items.length === 0) return [];
        const arr: IHighCrime[] = [];
        items.forEach((e) => {
            arr.push(HighCrimeRate(e));
        });
        return arr;
    };
}
