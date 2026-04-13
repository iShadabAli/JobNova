import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

const MapUpdater = ({ center }) => {
    const map = useMap();
    const prevCenter = useRef(null);

    useEffect(() => {
        if (center && center[0] && center[1]) {
            const hasChanged = !prevCenter.current ||
                prevCenter.current[0] !== center[0] ||
                prevCenter.current[1] !== center[1];

            if (hasChanged) {
                // Determine if it's a small jump or a big jump to choose between panTo and flyTo
                const currentCenter = map.getCenter();
                const distance = currentCenter.distanceTo([center[0], center[1]]);

                if (distance > 20000) { // If more than 20km, fly
                    map.flyTo(center, map.getZoom(), { animate: true, duration: 1.5, easeLinearity: 0.25 });
                } else if (distance > 10) { // If a smaller distance, just pan smoothly
                    map.panTo(center, { animate: true, duration: 0.5 });
                }

                prevCenter.current = center;
            }
        }
    }, [center, map]);

    return null;
};

export default MapUpdater;
