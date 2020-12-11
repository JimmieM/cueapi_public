import { SignalsMicroservice } from '../database/microservices/signals.ms';
import { ISignal, ICreateSignal } from '../interfaces/signal.interface';
import { Position } from '../services/position.service';

export namespace SignalsGateway {
    export const DeleteSignal = async (id: number) => {
        const create = await SignalsMicroservice.DeleteSignal(id);
        return create;
    };

    export const EditSignal = async (signal: ICreateSignal) => {
        if (!signal.id) throw new Error('missing id');

        const mapsPosition = await Position.GetCityAndStreetname(
            signal.position.gps.lat,
            signal.position.gps.lng,
        );

        const city = mapsPosition.city;
        const county = mapsPosition.county;
        const streetname = mapsPosition.streetName;

        if (!city || !streetname)
            throw new Error('Failed to find city and street');

        signal.streetname = streetname;
        signal.city = city;
        signal.county = county;

        const edit = await SignalsMicroservice.UpdateSignal(signal);
        return edit;
    };

    export const CreateSignal = async (signal: ICreateSignal) => {
        const mapsPosition = await Position.GetCityAndStreetname(
            signal.position.gps.lat,
            signal.position.gps.lng,
        );

        const city = mapsPosition.city;
        const streetname = mapsPosition.streetName;
        const county = mapsPosition.county;

        const obj = {
            ...signal,
            streetname,
            city,
            county,
        };
        const create = await SignalsMicroservice.AddSignal(obj);
        return create;
    };

    export const GetAllSignals = async () => {
        const signals = await SignalsMicroservice.GetAllSignals();
        const arr: ISignal[] = [];
        signals.map((s) => {
            arr.push({
                id: s.id,
                durationMinutes: s.duration_minutes,
                userId: s.user_id,
                position: {
                    gps: {
                        lat: Number(s.position_lat),
                        lng: Number(s.position_lng),
                        altitude: null,
                        accuracy: 0,
                    },
                    radius: s.position_radius,
                    timestamp: new Date(s.date_created).getTime(),
                    city: s.position_city,
                    streetname: s.position_streetname,
                },
                notified: false,
                name: s.name,
                eventType: JSON.parse(s.event_type) || [],
                keywords: JSON.parse(s.keywords) || [],
                strictKeywords: s.strict_keywords === 1 ? true : false,
                listenerType: s.listener_type,
            });
        });
        return arr;
    };

    export const GetSignals = async (userId: number) => {
        const signals = await SignalsMicroservice.GetSignals(userId);
        const arr: ISignal[] = [];
        signals.map((s) => {
            arr.push({
                id: s.id,
                durationMinutes: s.duration_minutes,
                userId: s.user_id,
                position: {
                    gps: {
                        lat: Number(s.position_lat),
                        lng: Number(s.position_lng),
                        altitude: null,
                        accuracy: 0,
                    },
                    radius: s.position_radius,
                    timestamp: new Date(s.date_created).getTime(),
                    city: s.position_city,
                    streetname: s.position_streetname,
                },
                notified: false,
                name: s.name,
                eventType: JSON.parse(s.event_type) || [],
                keywords: JSON.parse(s.keywords) || [],
                strictKeywords: s.strict_keywords === 1 ? true : false,
                listenerType: s.listener_type,
            });
        });

        return arr;
    };
}
