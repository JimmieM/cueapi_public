import { expect } from 'chai';
import { SignalerService } from '../signaler.service';

describe('Signaler service', () => {
    it('Shall match on same city', () => {
        const signal1 = `{ "id": 2, "durationMinutes": 2000, "userId": 1, "position": { "gps": { "lat": 55.59330969656136, "lng": 13.013414189172835, "altitude": 22, "accuracy": 1 }, "radius": 487, "timestamp": 200, "city": "Södertälje", "streetname": "" }, "notified": false, "name": "Droger222", "eventType": [ 12, 3, 4, 5,  1, 6, 7, 8, 9, 10 ], "keywords": [], "strictKeywords": false, "listenerType": "city" }`;

        const event1 = `{ "id": 223588, "authorized": true, "crime_rate_recorded": false, "datetime": "2020-09-07T16:05:00.000Z", "updated": "2020-09-07T16:05:00.000Z", "timeago": "1 d", "updatedTimeago": "1 d", "keywords": [], "name": "07 september 18:05, Arbetsplatsolycka", "summary": "Kvinna till sjukhus efter att ha ramlat ner.", "url": "", "type": "Arbetsplatsolycka", "suggestedEvents": [], "LocationGPSType": "initial", "location": { "radius": 1500, "timestamp": 1599590893474, "city": "Södertälje", "gps": { "lat": 57.398996, "lng": 14.665814 } }, "archived": false }`;

        const y = SignalerService.SignalMatches(
            JSON.parse(signal1),
            JSON.parse(event1),
        );

        expect(y.signalId).to.equal(2);
    });

    it('Shall match on same keywords', () => {
        const signal1 = `{ "id": 2, "durationMinutes": 2000, "userId": 1, "position": { "gps": { "lat": 55.59330969656136, "lng": 13.013414189172835, "altitude": 22, "accuracy": 1 }, "radius": 487, "timestamp": 200, "city": "Stockholm", "streetname": "Östergatan" }, "notified": false, "name": "Test", "eventType": [ 12, 3, 4, 5,  1, 6, 7, 8, 9, 10 ], "keywords": ["Cannabis", "Heroin"], "strictKeywords": false, "listenerType": "street" }`;

        const event1 = `{ "id": 223588, "authorized": true, "crime_rate_recorded": false, "datetime": "2020-09-07T16:05:00.000Z", "updated": "2020-09-07T16:05:00.000Z", "timeago": "1 d", "updatedTimeago": "1 d", "keywords": ["östergatan"], "name": "07 september 18:05, Arbetsplatsolycka", "summary": "Person tagen för innehav av cannabis och heroin på Östergatan", "url": "", "type": "Arbetsplatsolycka", "suggestedEvents": [], "LocationGPSType": "initial", "location": { "radius": 1500, "timestamp": 1599590893474, "city": "Stockholm", "gps": { "lat": 57.398996, "lng": 14.665814 } }, "archived": false }`;

        const signal2 = `{ "id": 2, "durationMinutes": 2000, "userId": 1, "position": { "gps": { "lat": 55.59330969656136, "lng": 13.013414189172835, "altitude": 22, "accuracy": 1 }, "radius": 487, "timestamp": 200, "city": "Södra Sandby", "streetname": "" }, "notified": false, "name": "Test", "eventType": [ 12, 3, 4, 5,  1, 6, 7, 8, 9, 10 ], "keywords": [], "strictKeywords": false, "listenerType": "city" }`;

        const event2 = `{ "id": 223588, "authorized": true, "crime_rate_recorded": false, "datetime": "2020-09-07T16:05:00.000Z", "updated": "2020-09-07T16:05:00.000Z", "timeago": "1 d", "updatedTimeago": "1 d", "keywords": ["Södra Sandby"], "name": "07 september 18:05, Arbetsplatsolycka", "summary": "Mopedbrand, Södra Sandby", "url": "", "type": "Brand", "suggestedEvents": [], "LocationGPSType": "initial", "location": { "radius": 1500, "timestamp": 1599590893474, "city": "Lund", "gps": { "lat": 57.398996, "lng": 14.665814 } }, "archived": false }`;

        const y = SignalerService.SignalMatches(
            JSON.parse(signal1),
            JSON.parse(event1),
        );
        const x = SignalerService.SignalMatches(
            JSON.parse(signal2),
            JSON.parse(event2),
        );
        expect(y.signalId).to.equal(2);
        expect(x.signalId).to.equal(2);
    });

    it('Shall not match since different cities', () => {
        const signal1 = `{ "id": 2, "durationMinutes": 2000, "userId": 1, "position": { "gps": { "lat": 55.59330969656136, "lng": 13.013414189172835, "altitude": 22, "accuracy": 1 }, "radius": 487, "timestamp": 200, "city": "Stockholm", "streetname": "Östergatan" }, "notified": false, "name": "Droger222", "eventType": [ 12, 3, 4, 5,  1, 6, 7, 8, 9, 10 ], "keywords": ["Cannabis", "Heroin"], "strictKeywords": false, "listenerType": "street" }`;

        const event1 = `{ "id": 223588, "authorized": true, "crime_rate_recorded": false, "datetime": "2020-09-07T16:05:00.000Z", "updated": "2020-09-07T16:05:00.000Z", "timeago": "1 d", "updatedTimeago": "1 d", "keywords": ["östergatan"], "name": "07 september 18:05, Arbetsplatsolycka", "summary": "Person tagen för innehav av cannabis och heroin på Östergatan", "url": "", "type": "Arbetsplatsolycka", "suggestedEvents": [], "LocationGPSType": "initial", "location": { "radius": 1500, "timestamp": 1599590893474, "city": "Malmö", "gps": { "lat": 57.398996, "lng": 14.665814 } }, "archived": false }`;

        const y = SignalerService.SignalMatches(
            JSON.parse(signal1),
            JSON.parse(event1),
        );
        expect(y).to.be.null;
    });

    it('Shall not match since not within radius', () => {
        const signal1 = `{ "id": 2, "durationMinutes": 2000, "userId": 1, "position": { "gps": { "lat": 55.59320969656136, "lng": 13.013414189172835, "altitude": 22, "accuracy": 1 }, "radius": 487, "timestamp": 200, "city": "Stockholm", "streetname": "Östergatan" }, "notified": false, "name": "Droger222", "eventType": [ 12, 3, 4, 5,  1, 6, 7, 8, 9, 10 ], "keywords": ["Cannabis", "Heroin"], "strictKeywords": false, "listenerType": "radius" }`;
        const event1 = `{ "id": 223588, "authorized": true, "crime_rate_recorded": false, "datetime": "2020-09-07T16:05:00.000Z", "updated": "2020-09-07T16:05:00.000Z", "timeago": "1 d", "updatedTimeago": "1 d", "keywords": ["östergatan"], "name": "07 september 18:05, Arbetsplatsolycka", "summary": "Person tagen för innehav av cannabis och heroin på Östergatan", "url": "", "type": "Arbetsplatsolycka", "suggestedEvents": [], "LocationGPSType": "initial", "location": { "radius": 1500, "timestamp": 1599590893474, "city": "Stockholm", "gps": { "lat": 55.59330969656136, "lng": 13.013414189172835 } }, "archived": false }`;
        const y = SignalerService.SignalMatches(
            JSON.parse(signal1),
            JSON.parse(event1),
        );
        expect(y).to.be.null;
    });

    it('Shall match since within radius', () => {
        const signal1 = `{ "id": 2, "durationMinutes": 2000, "userId": 1, "position": { "gps": { "lat": 55.5320969656136, "lng": 13.013414189172835, "altitude": 22, "accuracy": 1 }, "radius": 2000, "timestamp": 200, "city": "Stockholm", "streetname": "Östergatan" }, "notified": false, "name": "Droger222", "eventType": [ 12, 3, 4, 5,  1, 6, 7, 8, 9, 10 ], "keywords": ["Cannabis", "Heroin"], "strictKeywords": false, "listenerType": "radius" }`;

        const event1 = `{ "id": 223588, "authorized": true, "crime_rate_recorded": false, "datetime": "2020-09-07T16:05:00.000Z", "updated": "2020-09-07T16:05:00.000Z", "timeago": "1 d", "updatedTimeago": "1 d", "keywords": ["östergatan"], "name": "07 september 18:05, Arbetsplatsolycka", "summary": "Person tagen för innehav av cannabis och heroin på Östergatan", "url": "", "type": "Arbetsplatsolycka", "suggestedEvents": [], "LocationGPSType": "initial", "location": { "radius": 1500, "timestamp": 1599590893474, "city": "Stockholm", "gps": { "lat": 55.59230969656136, "lng": 13.013414189172835 } }, "archived": false }`;

        const y = SignalerService.SignalMatches(
            JSON.parse(signal1),
            JSON.parse(event1),
        );
        expect(y).not.to.be.null;
    });
});
