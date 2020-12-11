import { IEvent } from '../interfaces/event.interface';
import { SuggestedEventsMicroservice } from '../database/microservices/suggested-events.ms';
import { CoordsHelper } from '../helpers/coords.helper';
import { KarmaService } from './karma.service';
import { UsersMicroservice } from '../database/microservices/users.ms';

export namespace SuggestedEventsService {
    export const EventHasCorrespondingCustomEvents = (
        event: IEvent,
        suggestedEvents: IEvent[],
    ): IEvent[] | null => {
        if (suggestedEvents.length > 0) {
            const filtered = suggestedEvents.filter(
                (s) =>
                    s.location.city === event.location.city &&
                    s.type === event.type,
            );
            return filtered.map((suggestedEvent) => {
                const metersBetweenEvents = CoordsHelper.GetMeters(
                    suggestedEvent.location.gps.lat,
                    suggestedEvent.location.gps.lng,
                    event.location.gps.lat,
                    event.location.gps.lng,
                );
                if (metersBetweenEvents < 1000) {
                    return suggestedEvent;
                }
            });
        }
        return null;
    };

    export const ArchiveSuggestedEvent = async (
        eventId: number,
        userIdsReported: number[],
    ): Promise<boolean> => {
        const archive = await SuggestedEventsMicroservice.SetArchived(eventId);
        if (archive) {
            const newKarma = KarmaService.CalculateNewKarma(
                'deleted-event-suggestion',
            );
            userIdsReported.forEach(async (userId) => {
                await UsersMicroservice.UpdateKarma(userId, newKarma);
            });
            return true;
        }
        return false;
    };

    export const CustomEventHasCorrespondingEvent = (
        suggestedEvent: IEvent,
        events: IEvent[],
    ) => {};
}
