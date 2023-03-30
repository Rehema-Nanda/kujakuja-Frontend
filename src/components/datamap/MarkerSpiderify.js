export default class MarkerSpiderify {

    constructor (mapZoom) {
        this.zoom = mapZoom;
    }

    distanceBetweenCoordinatesInKm (lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        return d;
    }

    deg2rad (deg) {
        return deg * ( Math.PI / 180 );
    }

    rad2deg (n) {
        return n * 180 / Math.PI;
    };

    latLngFromDistanceAndBearing (lat1, lon1, brng, dist) {
        let a = 6378137, b = 6356752.3142, f = 1 / 298.257223563, s = dist, alpha1 = this.deg2rad(brng),
        sinAlpha1 = Math.sin(alpha1), cosAlpha1 = Math.cos(alpha1), tanU1 = ( 1 - f ) * Math.tan(this.deg2rad(lat1)), cosU1 = 1 / Math.sqrt(( 1 + tanU1 * tanU1 )),
        sinU1 = tanU1 * cosU1, sigma1 = Math.atan2(tanU1, cosAlpha1), sinAlpha = cosU1 * sinAlpha1, cosSqAlpha = 1 - sinAlpha * sinAlpha, uSq = cosSqAlpha * ( a * a - b * b ) / ( b * b ),
        A = 1 + uSq / 16384 * ( 4096 + uSq * ( -768 + uSq * ( 320 - 175 * uSq ) ) ), B = uSq / 1024 * ( 256 + uSq * ( -128 + uSq * ( 74 - 47 * uSq ) ) ), sigma = s / ( b * A ), sigmaP = 2 * Math.PI;
        while (Math.abs(sigma - sigmaP) > 1e-12) {
            var cos2SigmaM = Math.cos(2 * sigma1 + sigma),
            sinSigma = Math.sin(sigma), cosSigma = Math.cos(sigma),
            deltaSigma = B * sinSigma * ( cos2SigmaM + B / 4 * ( cosSigma * ( -1 + 2 * cos2SigmaM * cos2SigmaM ) - B / 6 * cos2SigmaM * ( -3 + 4 * sinSigma * sinSigma ) * ( -3 + 4 * cos2SigmaM * cos2SigmaM ) ) );
            sigmaP = sigma;
            sigma = s / ( b * A ) + deltaSigma
        }
        var tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1, lat2 = Math.atan2(sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1, ( 1 - f ) * Math.sqrt(sinAlpha * sinAlpha + tmp * tmp)),
        lambda = Math.atan2(sinSigma * sinAlpha1, cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1), C = f / 16 * cosSqAlpha * ( 4 + f * ( 4 - 3 * cosSqAlpha ) ),
        L = lambda - ( 1 - C ) * f * sinAlpha * ( sigma + C * sinSigma * ( cos2SigmaM + C * cosSigma * ( -1 + 2 * cos2SigmaM * cos2SigmaM ) ) );
        // var revAz = Math.atan2(sinAlpha, -tmp);
        return [this.rad2deg(lat2), lon1 + this.rad2deg(L)]
    }

    findCoordinates (lat, long, distance, numberOfPoints) {

        const degreesPerPoint = 360 / numberOfPoints;
        // Keep track of the angle from centre to radius
        let currentAngle = 0;
        // Track the points we generate to return at the end
        const points = [];

        for (let i = 0; i < numberOfPoints; i++) {

            const latLng = this.latLngFromDistanceAndBearing(lat, long, currentAngle, distance);
            points.push({
                lat: latLng[0],
                lng: latLng[1]
            });

            // Shift our angle around for the next point
            currentAngle += degreesPerPoint;
        }

        // Return the points we've generated
        return points;
    }

    setPointDistanceBasedOnZoom () {

        const zoom = parseInt(this.zoom, 10);
        if ( zoom >= 18 ) return 50;
        if ( zoom <= 10 ) return 4000;

        switch (zoom) {
            case 9:
                return 3000;
            case 10:
                return 2500;
            case 11:
                return 2000;
            case 12:
                return 1500;
            case 13:
                return 1000;
            case 14:
                return 500;
            case 15:
                return 400;
            case 16:
                return 100;
            case 17:
                return 75;
            default:
                return 1000;
        }
    }

}
