import { expect } from 'chai';
import { KeywordsService } from '../keywords.service';

describe('Keyword service', () => {
    it('Shall scan src keywords', () => {
        const newKeywords1 = KeywordsService.CleanSrcKeywords(
            'Två till sjukhus efter olycka på Västra östergatan/Fritavägen.'.split(
                ' ',
            ),
        );

        const newKeywords2 = KeywordsService.CleanSrcKeywords(
            'Lilla Mölleberga.'.split(' '),
        );

        expect(newKeywords1).includes('Västra östergatan/Fritavägen');
        expect(newKeywords2).includes('Lilla Mölleberga');
    });

    it('Shall have street', () => {
        const locations = KeywordsService.HasLocations(
            'Två till sjukhus efter olycka på Torshällavägen.'.split(' '),
            'Malmö',
        );
        expect(locations.possibleStreets).includes('Torshällavägen');
    });

    it('Shall have double-street', () => {
        const locations = KeywordsService.HasLocations(
            'Två till sjukhus efter olycka på Västra östergatan/Fritavägen.'.split(
                ' ',
            ),
            'Malmö',
        );
        expect(locations.possibleStreets).includes(
            'Fritavägen',
            'Västra östergatan',
        );
    });

    it('Shall have autobahn', () => {
        const y = KeywordsService.HasLocations(
            'Trafikbrott på E4 vid Ljusvattnet.'.split(' '),
            'Skellefteå',
        );
        const x = KeywordsService.HasLocations(
            'Trafikbrott på E18 vid Ljusvattnet.'.split(' '),
            'Skellefteå',
        );
        expect(y.possibleStreets).includes('E4');
        expect(x.possibleStreets).includes('E18');
    });

    it('Shall have vague location', () => {
        const locations = KeywordsService.HasLocations(
            'Fordonsförare i Rissne rapporterades för olovlig körning.'.split(
                ' ',
            ),
            'Sundbyberg',
        );
        expect(locations.possibleLocations).includes('Rissne');
    });

    it('Shall handle synonyms', () => {
        const match = KeywordsService.KeywordExistInSignal(
            ['gothenburg'],
            ['göteborg'],
        );
        expect(match).to.be.true;
    });

    it('Shall get city block from block file', () => {
        const x = KeywordsService.HasLocations(
            'Person dödad i Luckebo på en bänk'.split(' '),
            'Örebro',
        );
        const y = KeywordsService.HasLocations(
            'Person dödad i Kallboda på en bänk'.split(' '),
            'Stockholm',
        );
        const z = KeywordsService.HasLocations(
            'Person dödad i Lilla Havsjön på en bänk'.split(' '),
            'Örebro',
        );
        const t = KeywordsService.HasLocations(
            'Person dödad i Norra Husby på en bänk'.split(' '),
            'Örebro',
        );
        const n = KeywordsService.HasLocations(
            'Person dödad i Västra Frölunda på en bänk'.split(' '),
            'Örebro',
        );
        const m = KeywordsService.HasLocations(
            'Person dödad i Beddinge Läge på en bänk'.split(' '),
            'Lund',
        );
        const v = KeywordsService.HasLocations(
            'Person dödad i Hagnesta hill på en bänk'.split(' '),
            'Eskilstuna',
        );
        const b = KeywordsService.HasLocations(
            'Person dödad i Hagnesta hill på Toftavägen på en bänk'.split(' '),
            'Eskilstuna',
        );

        expect(x.possibleLocations).includes('Luckebo');
        expect(y.possibleLocations).includes('Kallboda');
        expect(z.possibleLocations).includes('Lilla Havsjön');
        expect(t.possibleLocations).includes('Norra Husby');
        expect(n.possibleLocations).includes('Västra Frölunda');
        expect(m.possibleLocations).includes('Beddinge Läge');

        expect(b.possibleStreets).includes('Toftavägen');
        expect(b.possibleLocations).includes('Hagnesta hill');
    });
});
