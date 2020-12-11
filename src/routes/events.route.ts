import express from 'express';
import { EventsGateway } from '../gateways/events.gateway';
import { IServerReply } from '../interfaces/serverreply.interface';
import { Settings } from '../settings/settings';
import { Position } from '../services/position.service';
import { IEvent } from '../interfaces/event.interface';
import { EventsService } from '../services/events.service';

const router = express.Router();

const prefix = '/' + Settings.env.name;

/// force update events
router.get(prefix + '/events/force', async (req: any, res: any) => {
    if (
        Settings.env.name === 'prod' ||
        Settings.env.name === 'test' ||
        Settings.env.name === 'stage'
    ) {
        EventsService.fetchEvents();
    } else {
        EventsService.localEvents();
    }
    res.status(200).send({ success: true });
});

/// suggest location
router.post(prefix + '/events/suggestlocation', async (req: any, res: any) => {
    const { suggestedLocation } = req.body;
    if (!suggestedLocation) {
        res.status(500).send({
            success: false,
            errorMessage: 'ER_MISSING_PARAMS',
        } as IServerReply);
    } else {
        const data = await EventsGateway.SuggestEventLocation(
            suggestedLocation,
        );
        res.status(200).send({ success: true, data });
    }
});

/// Create Events
router.post(prefix + '/events/create', async (req: any, res: any) => {
    const { suggestedEvent } = req.body;
    if (!suggestedEvent) {
        res.status(500).send({
            success: false,
            errorMessage: 'ER_MISSING_PARAMS',
        } as IServerReply);
    } else {
        const data = await EventsGateway.CreateSuggestedEvent(suggestedEvent);
        res.status(200).send({ success: data });
    }
});

router.post(prefix + '/events/report', async (req: any, res: any) => {
    const { eventId, userId } = req.body;
    if (!userId || !eventId) {
        res.status(500).send({
            success: false,
            errorMessage: 'ER_MISSING_PARAMS',
        } as IServerReply);
    } else {
        const resp = await EventsGateway.ReportSuggestedEvent(eventId, userId);
        res.status(200).send({
            success: resp,
            errorMessage: !resp && 'ERR_INTERNAL_ERROR',
        });
    }
});

router.post(prefix + '/events/upvote', async (req: any, res: any) => {
    const { eventId } = req.body;

    if (!eventId) {
        res.status(500).send({
            success: false,
            errorMessage: 'ER_MISSING_PARAMS',
        } as IServerReply);
    } else {
        const resp = await EventsGateway.UpvoteSuggestedEvent(eventId);

        res.status(200).send({
            success: resp,
            errorMessage: !resp && 'ERR_INTERNAL_ERROR',
        });
    }
});

/// Get ALL 3 Events
router.post(prefix + '/events', async (req: any, res: any) => {
    const { position, userId } = req.body;

    let allLocalEvents: {
        city: string;
        events: IEvent[];
    } = {
        city: undefined,
        events: [],
    };
    let allRecentLocalSuggestedEvents: IEvent[] = [];
    if (position) {
        const updatedPosition = await Position.UpdateUserLocationIfNeeded(
            position,
        );

        allLocalEvents = await EventsGateway.FetchLocalEvents(5000, [
            updatedPosition.city,
            updatedPosition.county,
        ]);
        allRecentLocalSuggestedEvents = await EventsGateway.GetRecentSuggestedEvents(
            2000,
            updatedPosition.city,
            userId,
        );
    }

    const allRecentEvents = await EventsGateway.FetchRecentEvents(2000);

    if (allRecentEvents) {
        res.status(200).send({
            success: true,
            data: {
                all: allRecentEvents,
                local: allLocalEvents,
                localSuggestions: allRecentLocalSuggestedEvents,
            },
        } as IServerReply);
    } else {
        res.status(500).send({
            success: false,
            errorMessage: 'ERR_INTERNAL_ERROR',
        } as IServerReply);
    }
});

export default router;
