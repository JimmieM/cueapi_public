import { SignalsGateway } from '../gateways/signals.gateway';
import {
    GetEventIconTypeByName,
    EventTypes,
} from '../models/events-types.model';
import { EventsGateway } from '../gateways/events.gateway';
import { KeywordsService, KeywordMatch } from './keywords.service';
import { IEvent } from '../interfaces/event.interface';
import { NotificationsMicroservice } from '../database/microservices/notifications.ms';
import {
    IPushNotification,
    PushNotificationsService,
} from './push-notifications';
import { UsersMicroservice } from '../database/microservices/users.ms';
import { ILatLng } from '../interfaces/position.interface';
import { CoordsHelper } from '../helpers/coords.helper';
import { ISignal } from '../interfaces/signal.interface';
//import { LogService } from './log.service';

//const Logger = new LogService('signaler.service');

interface ISignalMatch {
    userId: number;
    signalId: number;
    event: IEvent;
    keywordMatches?: KeywordMatch[];
}

export namespace SignalerService {
    export const GetRecentEvents = async (
        minutes: number,
        eventTypes?: string[],
    ) => {
        return await EventsGateway.FetchRecentEvents(minutes, eventTypes);
    };

    export const EligibleForEventSignal = async (
        eventId: number,
        signalId: number,
    ) => {
        const match = await NotificationsMicroservice.GetNotification(
            eventId,
            signalId,
        );
        return match ? false : true;
    };

    export const IOSNotification = async (
        id: number,
        data: string,
        deviceToken: string,
        userId: number,
    ): Promise<boolean> => {
        const notification: IPushNotification = {
            userId: userId,
            devicetoken: deviceToken,
            notification: {
                id: id,
                type: 'signal',
                data: data,
                exp: 2000,
            },
        };
        return await PushNotificationsService.APN(notification);
    };

    export const SignalUser = async (match: ISignalMatch): Promise<boolean> => {
        const eligible = await EligibleForEventSignal(
            match.event.id,
            match.signalId,
        );
        if (!eligible) return false;

        const getUser = await UsersMicroservice.GetUserByUserId(match.userId);

        if (getUser && getUser.length > 0) {
            const user = getUser[0];

            if (!user.device_token) return;
            if (user.device_os === 'ios') {
                const notificationStr =
                    match.event.summary.length > 50
                        ? [match.event.summary.slice(0, 33), '...'].join('')
                        : match.event.summary;
                const sendiOS = await IOSNotification(
                    match.event.id,
                    `${GetEventIconTypeByName(match.event.type)} ${
                        match.event.location.city
                    }: ${notificationStr}`,
                    user.device_token,
                    user.id,
                );

                if (sendiOS) {
                    return await NotificationsMicroservice.AddNotification(
                        match.event.id,
                        match.signalId,
                        match.userId,
                    );
                }
            }
            return false;
        }
        return false;
    };

    export const TriggerSignalsRefresh = async (
        minutes: number,
        userId?: number,
    ): Promise<ISignalMatch[]> => {
        const signalMatches: ISignalMatch[] = [];

        let getSignals = GetAllSignals();
        if (userId) {
            getSignals = GetSignals(userId);
        }
        const signals = await getSignals;

        // get all recent event where these signals are based
        const events = await GetRecentEvents(minutes, null);

        const addMatch = (match: ISignalMatch) => {
            if (
                !signalMatches.find(
                    (m) =>
                        m.userId === match.userId &&
                        m.event.id === match.event.id,
                )
            ) {
                signalMatches.push(match);
            }
        };

        events.forEach((event) => {
            signals.forEach((signal) => {
                const match = SignalMatches(signal, event);

                if (match && signalMatches.find) addMatch(match);
            });
        });

        return signalMatches;
    };

    export const SignalMatches = (
        signal: ISignal,
        event: IEvent,
    ): ISignalMatch | null => {
        const res = {
            userId: signal.userId,
            signalId: signal.id,
            event: event,
        };
        // if the event type is not what signal is listening for
        if (!EventTypes.find((e) => signal.eventType.includes(e.id))) null;

        const matches =
            KeywordsService.KeywordExistInSignal(
                [
                    ...signal.keywords,
                    signal.position.city,
                    signal.position.county,
                ],
                event.keywords,
            ) || event.location.city === signal.position.city;
        if (!matches) return null;

        // user listens to very specific keywords.
        const keywordMatches = KeywordsService.FindKeywords(
            signal.keywords,
            event.summary,
        );

        // if only listen to street and it wasnt mentioned
        if (signal.listenerType === 'street') {
            if (
                signal.position.streetname &&
                event.keywords.find(
                    (key) =>
                        key.toLowerCase() ===
                        signal.position.streetname.toLowerCase(),
                )
            ) {
                return res;
            } else {
                return keywordMatches ? res : null;
            }
        }

        // if listen to radius and event to signal radius is too high
        const eventLatLng = event.location.gps as ILatLng;

        if (
            signal.listenerType === 'radius' &&
            Math.round(
                CoordsHelper.GetMeters(
                    signal.position.gps.lat,
                    signal.position.gps.lng,
                    eventLatLng.lat,
                    eventLatLng.lng,
                ),
            ) <= signal.position.radius
        ) {
            // is radius type but isnt within its bounds
            return null;
        }
        return res;
    };

    const GetSignals = async (userId: number) => {
        return await SignalsGateway.GetSignals(userId);
    };

    const GetAllSignals = async () => {
        return await SignalsGateway.GetAllSignals();
    };
}
