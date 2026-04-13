import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MapUpdater from './MapUpdater';

// Fix for default Leaflet marker icons not loading correctly in React
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    iconAnchor: [12, 41], // Center-bottom of the default icon
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

// Default center (Lahore, Pakistan)
const defaultCenter = [31.5204, 74.3587];

const LocationMarker = ({ position, setPosition, readOnly }) => {
    useMapEvents({
        click(e) {
            if (!readOnly && setPosition) {
                setPosition(e.latlng);
            }
        },
    });

    if (position === null) return null;

    const searchLocationIcon = L.divIcon({
        className: 'custom-job-marker',
        html: `
            <div class="marker-pin" style="background: var(--accent-success);"></div>
            <div class="marker-pulse" style="background: var(--accent-success);"></div>
            <div class="marker-icon-inner">🔍</div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 42],
        popupAnchor: [0, -42]
    });

    const userCurrentIcon = L.divIcon({
        className: 'modern-user-marker',
        html: `
            <div class="user-pulse"></div>
            <div class="user-dot"></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    });

    return (
        <Marker
            position={position}
            icon={readOnly ? userCurrentIcon : searchLocationIcon}
        >
            {readOnly ? <Popup>Your Current Search Location</Popup> : <Popup>Selected Job Location</Popup>}
        </Marker>
    );
};

const JobMap = ({ jobs = [], onLocationSelect, onJobClick, onProfileClick, center = defaultCenter, readOnly = true, setUserLocation }) => {
    const [selectedPosition, setSelectedPosition] = React.useState(null);

    // Initial position for readOnly mode overriding
    React.useEffect(() => {
        if (readOnly && center && center[0] !== defaultCenter[0]) {
            setSelectedPosition(center);
        }
    }, [center, readOnly]);

    const [activeRoute, setActiveRoute] = React.useState(null);
    const [routeDistance, setRouteDistance] = React.useState(null);
    const [routeDuration, setRouteDuration] = React.useState(null);

    const clearRoute = () => {
        setActiveRoute(null);
        setRouteDistance(null);
        setRouteDuration(null);
    };

    const handlePositionChange = (latlng) => {
        setSelectedPosition(latlng);
        if (onLocationSelect) {
            onLocationSelect(latlng.lat, latlng.lng);
        }
        if (setUserLocation && readOnly) {
            setUserLocation({ lat: latlng.lat, lng: latlng.lng });
            clearRoute(); // clear previous route if location changes
        }
    };

    const fetchRoute = async (job) => {
        if (!center || !center[0] || !center[1] || !job.latitude || !job.longitude) return;
        try {
            const startLng = center[1];
            const startLat = center[0];
            const endLng = job.longitude;
            const endLat = job.latitude;

            const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.routes && data.routes[0]) {
                const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                setActiveRoute(coords);

                // distance in meters to km
                setRouteDistance((data.routes[0].distance / 1000).toFixed(1));
                // duration is in seconds to minutes
                setRouteDuration(Math.round(data.routes[0].duration / 60));
            }
        } catch (e) {
            console.error("Failed to fetch route", e);
        }
    };

    return (
        <div style={{ height: '400px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', zIndex: 0 }}>
            <MapContainer
                center={center}
                zoom={12}
                scrollWheelZoom={true}
                zoomAnimation={true}
                fadeAnimation={true}
                markerZoomAnimation={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap & CARTO'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                <MapUpdater center={center} />

                {!readOnly && (
                    <LocationMarker
                        position={selectedPosition}
                        setPosition={handlePositionChange}
                        readOnly={readOnly}
                    />
                )}

                {/* Optional User Location Marker if manual pin is enabled */}
                {(readOnly && setUserLocation) && (
                    <LocationMarker
                        position={selectedPosition}
                        setPosition={handlePositionChange}
                        readOnly={readOnly}
                    />
                )}

                {readOnly && jobs.map((job) => {
                    if (job.latitude && job.longitude) {
                        const jobIcon = L.divIcon({
                            className: 'custom-job-marker',
                            html: `
                                <div class="marker-pin"></div>
                                <div class="marker-pulse"></div>
                                <div class="marker-icon-inner">💼</div>
                            `,
                            iconSize: [42, 42],
                            iconAnchor: [21, 42],
                            popupAnchor: [0, -42]
                        });

                        return (
                            <Marker
                                key={job.id}
                                position={[job.latitude, job.longitude]}
                                icon={jobIcon}
                                eventHandlers={{
                                    click: () => fetchRoute(job),
                                    popupclose: () => clearRoute()
                                }}
                            >
                                <Tooltip direction="top" offset={[0, -30]} opacity={1} permanent>
                                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{job.titleUrdu || job.title}</span>
                                </Tooltip>
                                <Popup className="custom-popup">
                                    <div className="text-sm" style={{ padding: '4px' }}>
                                        <strong style={{ fontSize: '1.1rem', color: '#1e293b', display: 'block', marginBottom: '4px' }}>{job.title}</strong>
                                        <p className="m-0 text-gray-600" style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                                            {job.skills_required && job.skills_required.length > 0 ? job.skills_required.join(', ') : 'No specific skills'}
                                        </p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            {job.salary_range || job.hourly_rate ? (
                                                <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.95rem' }}>
                                                    PKR {job.salary_range || job.hourly_rate}
                                                </span>
                                            ) : (
                                                <span style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Salary N/A</span>
                                            )}
                                        </div>
                                        {job.profiles && (
                                            <div style={{ marginBottom: '12px', padding: '8px', background: '#f1f5f9', borderRadius: '6px' }}>
                                                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#64748b' }}>Employer</strong>
                                                <div
                                                    style={{ fontSize: '0.9rem', color: '#4f46e5', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}
                                                    onClick={() => onProfileClick && onProfileClick({ ...job.profiles, user_id: job.employer_id })}
                                                    title="View Full Profile"
                                                >
                                                    <span style={{ background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', borderRadius: '50%', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                                    </span>
                                                    {job.profiles.company_name || job.profiles.full_name || 'View Profile'}
                                                </div>
                                            </div>
                                        )}
                                        {routeDistance && routeDuration && (
                                            <div style={{ padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px', marginBottom: '12px', fontSize: '0.85rem', color: '#475569', border: '1px solid #e2e8f0' }}>
                                                🛣️ <strong>{routeDistance} km</strong> away<br />
                                                ⏱️ Approx. <strong>{routeDuration} mins</strong> drive
                                            </div>
                                        )}
                                        <button
                                            style={{ backgroundColor: '#4f46e5', color: 'white', padding: '8px 12px', border: 'none', borderRadius: '6px', width: '100%', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' }}
                                            onMouseOver={(e) => e.target.style.backgroundColor = '#4338ca'}
                                            onMouseOut={(e) => e.target.style.backgroundColor = '#4f46e5'}
                                            onClick={() => onJobClick && onJobClick(job)}
                                        >
                                            View Details / Apply
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    }
                    return null;
                })}

                {activeRoute && (
                    <Polyline
                        positions={activeRoute}
                        color="#4f46e5"
                        weight={5}
                        opacity={0.8}
                        dashArray="10, 10" // Optional dashed line style for directions
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default JobMap;
