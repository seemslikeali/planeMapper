export default function createLatLng (obj) {
    if (Object.hasOwn(obj, 'latitude') && Object.hasOwn(obj, 'longitude')) {
        return L.latLng(parseFloat(obj.latitude), parseFloat(obj.longitude));
    }

    return null;
}

export function createLatLngs (...objs) {
    const latlngs = [];

    for (const obj of objs) {
        if (obj) latlngs.push(obj);
    }

    return latlngs;
}