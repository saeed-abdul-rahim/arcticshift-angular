import { Point } from '@models/Common';

export const haversineDistance = (loc1: Point, loc2: Point, isMiles = false) => {
    const { lat: lat1, lon: lon1 } = loc1;
    const { lat: lat2, lon: lon2 } = loc2;

    const toRadian = (angle: number) => (Math.PI / 180) * angle;
    const distance = (a: number, b: number) => (Math.PI / 180) * (a - b);
    const RADIUS_OF_EARTH_IN_KM = 6371;

    const dLat = distance(lat2, lat1);
    const dLon = distance(lon2, lon1);

    const lat1Rad = toRadian(lat1);
    const lat2Rad = toRadian(lat2);

    // Haversine Formula
    const h =
        Math.pow(Math.sin(dLat / 2), 2) +
        Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
    const c = 2 * Math.asin(Math.sqrt(h));

    let finalDistance = RADIUS_OF_EARTH_IN_KM * c;

    if (isMiles) {
        finalDistance /= 1.60934;
    }

    return finalDistance;
};
