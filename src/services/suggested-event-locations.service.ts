import { ILatLng } from '../interfaces/position.interface';
import { CoordsHelper } from '../helpers/coords.helper';

export namespace SuggestedEventLocations {
    export const SuggestedLatLngIsWithinBounds = (
        latLng: ILatLng,
        differ: ILatLng[],
    ) => {
        if (differ.length <= 1) return true;
        let maxMeterRequirement = 0;
        if (differ.length > 1 && differ.length <= 5) {
            maxMeterRequirement = 1000;
        } else if (differ.length > 5 && differ.length < 9) {
            maxMeterRequirement = 800;
        } else if (differ.length > 9 && differ.length < 16) {
            maxMeterRequirement = 400;
        } else if (differ.length > 16 && differ.length < 23) {
            maxMeterRequirement = 275;
        } else {
            maxMeterRequirement = 150;
        }

        const center = CoordsHelper.GetCenter(differ);
        const metersBetweenNewAndCenter = CoordsHelper.GetMeters(
            center.lat,
            center.lng,
            latLng.lat,
            latLng.lng,
        );
        if (metersBetweenNewAndCenter < maxMeterRequirement) return true;
        return false;
    };
}
