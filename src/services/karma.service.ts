export type GainKarmaType =
    | 'deleted-event-suggestion'
    | 'suggested-location'
    | 'verified-suggested-event';

export namespace KarmaService {
    export const CalculateNewKarma = (gainType: GainKarmaType) => {
        switch (gainType) {
            case 'deleted-event-suggestion':
                return 2500;
            case 'suggested-location':
                return 6000;
            case 'verified-suggested-event':
                return 8000;
            default:
                return 0;
        }
    };
}
