import { ILatLng } from '../interfaces/position.interface';

export namespace CoordsHelper {
    export const StringToLatLng = (x: string) => {
        return {
            lat: Number(x.split(',')[0]),
            lng: Number(x.split(',')[1]),
        };
    };

    export const GetMeters = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
    ) => {
        var R = 6378.137;
        var dLat = (lat2 * Math.PI) / 180 - (lat1 * Math.PI) / 180;
        var dLon = (lon2 * Math.PI) / 180 - (lon1 * Math.PI) / 180;
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d * 1000;
    };

    export const GetCenter = (arr: ILatLng[]): ILatLng => {
        var x = arr.map((a) => {
            return a.lat;
        });
        var y = arr.map((a) => {
            return a.lng;
        });
        var minX = Math.min.apply(null, x);
        var maxX = Math.max.apply(null, x);
        var minY = Math.min.apply(null, y);
        var maxY = Math.max.apply(null, y);
        const z = [(minX + maxX) / 2, (minY + maxY) / 2];
        return {
            lat: z[0],
            lng: z[1],
        };
    };
}
