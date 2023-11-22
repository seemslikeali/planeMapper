function calculateHeading (
        lat2, lat1, lng2, lng1, {offset = 0} = {}) {
    const toRadians = (deg) => deg * (Math.PI / 180);
    const toDegrees = (rad) => rad * (180 / Math.PI);

    // Convert the latitudes and longitudes from degrees to radians.
    const lat2Rad = toRadians(lat2);
    const lat1Rad = toRadians(lat1);
    const lng2Rad = toRadians(lng2);
    const lng1Rad = toRadians(lng1);

    // Calculate the heading and convert it from radians to degrees.
    const lngDiff = lng2Rad - lng1Rad;
    const y = Math.cos(lat2Rad) * Math.sin(lngDiff);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) 
    * Math.cos(lat2Rad) * Math.cos(lngDiff);
    const heading = toDegrees(Math.atan2(y, x)) + offset;

    // Return the heading as a clockwise rotation in degrees ranging from 0 to
    //  360.
    return (heading + 360) % 360;
}

export default function getRotation (destination, origin, flight) {
    if (destination || origin) {
        // The plane icon from FontAwesome faces East. Headings are
        //  relative to North, meaning the icon needs a 90-degree
        //  counterclockwise rotation to properly rotate the icon
        //  to face the flight's calculated heading.
        const options = {offset: -90};
        let s = 'rotate(';

        if (destination) {
            s += calculateHeading(
                destination.lat, flight.lat, 
                destination.lng, flight.lng, options);
        } else {
            s += calculateHeading(
                flight.lat, origin.lat, 
                flight.lng, origin.lng, options);
        }

        return s + 'deg)';
    }

    return '';
};