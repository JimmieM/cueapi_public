import { StringHelpers } from '../helpers/string.helper';
import { SynonymService } from './synonym.service';

export interface KeywordMatch {
    keyword: string;
    matches: string[];
}

const mainBlacklist = ['Hemsidan uppdateras inte mer'];

const streetPrefixes = ['lilla', 'gamla', 'stora'];
const streetSuffixes = [
    'vägen',
    'gatan',
    'park',
    'parken',
    'torget',
    'torg',
    'hamn',
    'gård',
];
const streetCompassPrefixes = ['norra', 'södra', 'östra', 'västra'];
const streetBlacklist = [
    'gatan',
    '/',
    'vägen',
    'en',
    'ett',
    'samband',
    'diket',
    'dike',
    'lyktstolpe',
    'bilist',
    'ett',
    'och',
    'butik',
    'en',
    'kommunikatör',
    'trafikkontroll',
    'garage',
    'krock',
    'lokal',
    'företagslokal',
    'kollision',
    'väg',
    'dag',
    'på',
];

const cityBlockFiles = [
    'stockholm',
    'goteborg',
    'jonkoping',
    'eskilstuna',
    'linkoping',
    'lund',
    'malmo',
    'orebro',
    'vasteras',
];

const blacklistLocationPrefixes = [...streetBlacklist];
const vagueLocationPrefixes = ['område', 'vid', 'i', 'på', 'centrum', 'gård'];

export namespace KeywordsService {
    export const EventShouldBeLocated = (source: string) => {
        return mainBlacklist.some((e) => source.includes(e));
    };

    export const SimpleCleanSrcKeywords = (srcKeywords: string[]) => {
        const newKeywords = [...srcKeywords];
        for (let index = 0; index < srcKeywords.length; index++) {
            if (newKeywords[index])
                newKeywords[index] = newKeywords[index]
                    .replace(',', '')
                    .replace('.', '')
                    .replace(/"/g, '')
                    .trim()
                    .toLowerCase();
        }
        return newKeywords;
    };

    export const CleanSrcKeywords = (srcKeywords: string[]) => {
        const newKeywords = [...srcKeywords];
        for (let index = 0; index < srcKeywords.length; index++) {
            if (newKeywords[index])
                newKeywords[index] = newKeywords[index]
                    .replace(',', '')
                    .replace('.', '')
                    .replace(/"/g, '')
                    .trim();

            if (srcKeywords[index - 1]) {
                const streetPrefix = streetPrefixes.find(
                    (pref) =>
                        pref.toLowerCase() ===
                        srcKeywords[index - 1].toLowerCase(),
                );
                const compassPrefix = streetCompassPrefixes.find(
                    (pref) =>
                        pref.toLowerCase() ===
                        srcKeywords[index - 1].toLowerCase(),
                );
                if (streetPrefix || compassPrefix) {
                    newKeywords[index - 1] += ` ${newKeywords[index]}`;
                    newKeywords.splice(index, 1);
                }
            }
        }
        return newKeywords;
    };
    export const HasLocations = (
        srcKeywords: string[],
        initialCity: string,
    ): {
        possibleStreets: string[] | null;
        possibleLocations: string[] | null;
    } | null => {
        srcKeywords = CleanSrcKeywords(srcKeywords);
        if (srcKeywords.length > 0) {
            let possibleStreets: string[] = [];
            let possibleLocations: string[] = [];

            const hasBlockMention = HasCityBlockMentioning(
                srcKeywords,
                initialCity,
            );

            hasBlockMention && possibleLocations.push(hasBlockMention);

            for (let index = 0; index < srcKeywords.length; index++) {
                const srcKey = srcKeywords[index];

                const isAutobahn = HasAutobahn(srcKey);
                if (isAutobahn) {
                    possibleStreets.push(srcKey);
                    continue;
                }

                const streetLocations = HasStreetLocations(srcKey);
                const arr = [];
                const arr1 = [1, 2, 3];
                console.log(arr1[0]);

                if (streetLocations.length > 0) {
                    const hasStreetCompassLocation = HasStreetCompassLocation(
                        srcKeywords[index - 1],
                    );

                    // example: Västra östergatan/Fritavägen
                    if (
                        hasStreetCompassLocation &&
                        streetLocations.length > 1
                    ) {
                        // use Västra östergatan
                        streetLocations[0] = `${srcKeywords[index - 1]} ${
                            streetLocations[0]
                        }`;
                        // while Fritavägen remains a possible location(?)
                    }

                    if (StreetHasNumber(srcKeywords[index + 1])) {
                        if (streetLocations.length > 1) {
                            possibleStreets.push(
                                `${streetLocations[1]} ${
                                    srcKeywords[index + 1]
                                }`,
                            );
                        }
                    } else {
                        possibleStreets.push(...streetLocations);
                    }
                }
                if (streetLocations.length === 0)
                    if (
                        HasVagueLocation(srcKey, srcKeywords[index - 1]) &&
                        !blacklistLocationPrefixes.includes(
                            srcKeywords[index + 1],
                        )
                    ) {
                        possibleLocations.push(srcKeywords[index + 1]);
                    }
            }

            const filteredStreets = Array.from(
                new Set(possibleStreets.filter((d) => d !== null)),
            );

            const filteredLocations = Array.from(
                new Set(
                    possibleLocations.filter(
                        (d) => d !== null && !filteredStreets.includes(d),
                    ),
                ),
            );

            return {
                possibleLocations: filteredLocations,
                possibleStreets: filteredStreets,
            };
        }
        return null;
    };

    export const KeywordExistInSignal = (arr1: string[], arr2: string[]) => {
        const [smallArray, bigArray] =
            arr1.length < arr2.length
                ? [SimpleCleanSrcKeywords(arr1), SimpleCleanSrcKeywords(arr2)]
                : [SimpleCleanSrcKeywords(arr2), SimpleCleanSrcKeywords(arr1)];
        return smallArray.some((c) =>
            bigArray.find(
                (x) =>
                    x === c ||
                    (SynonymService.Synonyms.find(
                        (sy: { key: string; synonym: string }) =>
                            sy.key === c || sy.key === x,
                    ) &&
                        SynonymService.Synonyms.find(
                            (sy: { key: string; synonym: string }) =>
                                sy.key === c || sy.key === x,
                        ).synonym),
            ),
        );
    };

    export const FindKeywords = (
        keywords: string[],
        source: string,
    ): KeywordMatch[] => {
        const matches: KeywordMatch[] = [];
        keywords.map((keyword) => {
            const search = SearchSource(keyword, source);
            if (search) {
                matches.push(search);
            }
        });
        return matches;
    };

    export const FindMatchingKeywords = (keyword: string) => {};

    export const SearchSource = (
        keyword: string,
        source: string,
    ): KeywordMatch => {
        let lower = keyword.toLowerCase();
        if (source.includes(keyword) || source.includes(lower)) {
            return {
                keyword: keyword,
                matches: [keyword],
            };
        }
        return null;
    };

    const HasVagueLocation = (keyword: string, keyBefore?: string) => {
        return vagueLocationPrefixes.some(
            (e) =>
                e === keyword.toLowerCase() &&
                !blacklistLocationPrefixes.includes(keyBefore),
        );
    };

    const HandleCityBlockFiles = (city: string) => {
        if (!city || city === '') return null;
        city = StringHelpers.ReplaceChars(city).toLowerCase();
        if (city.includes('lan')) {
            city = city.split('lan')[0].trim();
        }
        if (cityBlockFiles.includes(city)) {
            return require(`../../resources/cities/blocks_${city}.json`);
        }
        return null;
    };

    const HasCityBlockMentioning = (
        keywords: string[],
        city: string,
    ): string | null => {
        const json = HandleCityBlockFiles(city);
        if (json) {
            let res = null;
            const obj = (typeof json === 'object'
                ? json
                : JSON.parse(json)) as string[];
            for (let i = 0; i < keywords.length; i++) {
                const search = obj.find((o) => {
                    return (
                        o === keywords[i] ||
                        (keywords[i + 1] &&
                            o === `${keywords[i]} ${keywords[i + 1]}`)
                    );
                });
                if (search) {
                    res = search;
                    break;
                }
            }
            return res;
        }
        return null;
    };

    const HasStreetLocations = (
        keyword: string,
        keyBefore?: string,
    ): string[] => {
        const check = (s: string, _keyBefore?: string): string[] => {
            const matches: string[] = [];

            const add = (street: string) => {
                if (!streetBlacklist.includes(street)) matches.push(street);
            };
            const possibleStreet = streetSuffixes.find((e) => s.includes(e));
            let possibleStreetBeforePrefix;
            if (keyBefore) {
                possibleStreetBeforePrefix = streetPrefixes.find((e) =>
                    _keyBefore.includes(e),
                );
            }

            if (possibleStreet) {
                add(s);
                if (possibleStreetBeforePrefix) {
                    add(`${keyBefore} ${s}`);
                }
            }
            return matches;
        };

        let locations: string[] = [];

        if (keyword.includes('/')) {
            const split = keyword.split('/');

            split.forEach((s, i) => {
                const matches = check(s, i == 0 && keyBefore);
                locations.push(...matches);
            });
        } else {
            const matches = check(keyword);
            locations.push(...matches);
        }

        return locations;
    };

    const HasAutobahn = (keyword: string): boolean => {
        return keyword.startsWith('E') && !isNaN(Number(keyword[1]));
    };

    const HasStreetCompassLocation = (keyword: string) => {
        if (keyword === undefined) return;
        const possibleStreet = streetCompassPrefixes.some((e) =>
            keyword.toLowerCase().includes(e),
        );

        if (keyword.includes('/')) {
            return keyword.split('/');
        }
        return possibleStreet;
    };

    const StreetHasNumber = (keyword: string) => {
        const isNumber = !isNaN(Number(keyword));
        if (isNumber) return true;
        return false;
    };
}
