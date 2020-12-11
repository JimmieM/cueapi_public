export interface ILatLng {
    lat: number;
    lng: number;
    altitude?: number;
    accuracy?: number;
}

export interface IPosition {
    gps: ILatLng;
    city?: string;
    county?: string;
    streetname?: string;
    radius: number;
    timestamp: number;
}
