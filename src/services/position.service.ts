import axios from 'axios';
import { ILatLng, IPosition } from '../interfaces/position.interface';
import { LogService } from './log.service';
import { StringHelpers } from '../helpers/string.helper';

const Logger = new LogService('positon.service');

const APIKey = 'my-key';

export namespace Position {
    export const UpdateUserLocationIfNeeded = async (
        position: IPosition,
    ): Promise<IPosition> => {
        let city = position.city;
        let county = position.county;
        if (!position.city) {
            const getCity = await Position.GetCityAndStreetname(
                position.gps.lat,
                position.gps.lng,
            );
            city = getCity.city;
            county = getCity.county;
        }

        return {
            ...position,
            city,
            county,
        };
    };

    export const GetLatLng = async (
        streetName: string,
        city: string,
        vagueLocation?: string,
    ): Promise<
        | (ILatLng & {
              streetName?: string;
              city?: string;
              vagueLocation?: string;
          })
        | null
    > => {
        if (!streetName && !vagueLocation) return null;
        streetName = StringHelpers.ReplaceChars(streetName);
        city = StringHelpers.ReplaceChars(city);
        if (!!vagueLocation) {
            vagueLocation = StringHelpers.ReplaceChars(vagueLocation);
        }

        let string = `https://maps.googleapis.com/maps/api/geocode/json?address=${
            streetName ? streetName : ''
        }${
            vagueLocation ? `+${vagueLocation}` : ''
        }+${city}&key=${APIKey}&language=se`;

        try {
            const response = await axios.get(string);

            Logger.Log(
                `GetLatLng: Requesting ${streetName} ${city} ${vagueLocation} ${string}`,
                1,
            );

            const result = response.data.results;

            if (!result) {
                return null;
            }

            return {
                ...(result[0].geometry.location as ILatLng),
                streetName,
                city,
                vagueLocation,
            };
        } catch (exception) {
            Logger.Log(
                `Failed to get LatLng ${string}. Street: ${streetName}, city: ${city}`,
                4,
            );
            return null;
        }
    };

    export const GetCityAndStreetname = async (
        lat: number,
        lng: number,
    ): Promise<{
        streetName: string;
        city: string;
        county: string;
    } | null> => {
        let string =
            'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
            lat +
            ',' +
            lng +
            '&sensor=true&key=' +
            APIKey;

        try {
            const response = await axios.get(string);

            const result = response.data.results;

            if (!result) {
                return null;
            }

            let streetName = '';
            let city = '';
            let county = '';

            for (let i = 0; i < result.length; i++) {
                for (let j = 0; j < result[i].types.length; j++) {
                    if (result[i].types[j] == 'postal_town') {
                        city = result[i].formatted_address;
                    }
                    if (result[i].types[j] == 'street_address') {
                        streetName = result[i].formatted_address;
                    }

                    if (result[i].types[j] == 'administrative_area_level_1') {
                        county = result[i].formatted_address;
                    }
                }
            }

            if (city.includes(',')) {
                city = city.substring(0, city.indexOf(','));
            }

            if (streetName.includes(',')) {
                streetName = streetName.substring(0, streetName.indexOf(','));
            }

            if (city.toLowerCase() === 'gothenburg') city = 'Göteborg';
            return {
                streetName,
                city,
                county,
            };
        } catch (exception) {
            Logger.Log(
                `Failed to get GetCityAndStreetname ${string}. lat: ${lat}, lng: ${lng}`,
                4,
            );
            return null;
        }
    };
}
