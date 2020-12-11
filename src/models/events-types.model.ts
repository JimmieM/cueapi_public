export const GetEventIconTypeByName = (type: string): string | undefined => {
    const event = EventTypes.find((x) => x.names.some((n) => n === type));
    if (event !== undefined) {
        return event.icon;
    }
    return '📰';
};

export const EventTypes = [
    {
        id: 1,
        names: [
            'Trafikolycka',
            'Trafikolycka, singel',
            'Trafikolycka, personskada',
            'Trafikolycka, smitning från',
            'Trafikolycka, vilt',
        ],
        icon: '💥🚗',
        iconColor: '#197278',
    },
    {
        id: 2,
        names: ['Fylleri/LOB', 'Alkohollagen', 'Rattfylleri'],
        icon: '🥴🍺',
        iconColor: '#d8a48f',
    },
    {
        id: 5,
        names: ['Trafikolycka, vilt', 'Djur skadat/omhändertaget'],
        icon: '🐗',
        iconColor: '#555b6e',
    },

    {
        id: 3,
        names: ['Arbetsplatsolycka'],
        icon: '👨‍🌾',
        iconColor: '#5390d9',
    },
    {
        id: 4,
        names: ['Kontroll person/fordon', 'Gränskontroll', 'Trafikkontroll'],
        icon: '👮‍♂️✋',
        iconColor: '#d8a48f',
    },
    {
        id: 6,
        names: ['Brand', 'Brand automatlarm'],
        icon: '🔥',
        iconColor: '#f48c06',
    },
    {
        id: 7,
        names: ['Bråk', 'Misshandel', 'Våld/hot mot tjänsteman'],
        icon: '👊😡',
        iconColor: '#f4acb7',
    },
    {
        id: 8,
        names: [
            'Motorfordon, stöld',
            'Motorfordon, anträffat stulet',
            'Stöld',
            'Stöld, försök',
            'Stöld, ringa',
            'Stöld/inbrott',
        ],
        icon: '🤫',
        iconColor: '#714674',
    },
    {
        id: 9,
        names: ['Narkotikabrott'],
        icon: '💊',
        iconColor: '#054a29',
    },

    {
        id: 10,
        names: ['Mord/dråp', 'Mord/dråp, försök', 'Misshandel, grov'],
        icon: '😵🗡️',
        iconColor: '#9d4edd',
    },
    {
        id: 11,
        names: ['Detonation', 'Bombhot'],
        icon: '💣',
        iconColor: '#ef8354',
    },
    {
        id: 12,
        names: ['HäleriInbrott', 'Inbrott, försök', 'Larm Inbrott'],
        icon: '🏠',
        iconColor: '#ffa69e',
    },
    {
        id: 13,
        names: ['Djur skadat/omhändertaget', 'Lagen om hundar och katter'],
        icon: '🐶',
        iconColor: '#f15152',
    },
    {
        id: 14,
        names: [
            'Skottlossning',
            'Skottlossning, misstänkt',
            'Rån väpnat',
            'Vapenlagen',
        ],
        icon: '🔫',
        iconColor: '#1e555c',
    },
    {
        id: 15,
        names: [
            'Larm Överfall',
            'Våldtäkt',
            'Våldtäkt, försök',
            'Vållande till kroppsskada',
            'Ofredande/förargelse',
        ],
        icon: '👢',
        iconColor: '#ef476f',
    },
    {
        id: 16,
        names: ['Övrigt'],
        icon: '📰',
        iconColor: '#3e07c6',
    },
    {
        id: 17,
        names: ['Försvunnen person'],
        icon: '🙍‍♂️❓',
        iconColor: '#3e07c6',
    },
];

// droger
// vilt
// bilolyckor
// bråk o shit
export const SignalEventTypes = ['🚨', '🌿', '🐗', '🚘', '👊😡'];
