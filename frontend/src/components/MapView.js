import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';

const MapView = () => {
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [userLocation, setUserLocation] = useState({ lat: 40.7128, lng: -74.0060 }); // Default: New York
    const [radius, setRadius] = useState(10); // Default: 10 km
    const [loading, setLoading] = useState(true);

    // Get user's current location (optional)
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.log('Location access denied or unavailable:', error);
                    // Keep default location
                }
            );
        }
    }, []);

    // Fetch nearby jobs when location or radius changes
    const fetchNearbyJobs = useCallback(async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('token');
            const response = await fetch(
                `http://localhost:5000/api/jobs/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${radius}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setJobs(data);
            }
        } catch (error) {
            console.error('Failed to fetch nearby jobs:', error);
        } finally {
            setLoading(false);
        }
    }, [userLocation, radius]);

    useEffect(() => {
        fetchNearbyJobs();
    }, [fetchNearbyJobs]);

    const handleMarkerClick = (job) => {
        setSelectedJob(job);
    };

    const handleApply = async (jobId) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/jobs/${jobId}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({})
            });

            if (response.ok) {
                toast.success('Applied successfully! (درخواست جمع کرائی گئی)');
                setSelectedJob(null);
            } else {
                toast.error('Failed to apply');
            }
        } catch (error) {
            console.error('Error applying:', error);
        }
    };

    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h3>⚠️ Google Maps API Key Missing</h3>
                <p>Please add REACT_APP_GOOGLE_MAPS_API_KEY to your .env file</p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '600px', position: 'relative' }}>
            {/* Radius Filter UI */}
            <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 10,
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
            }}>
                <label style={{ fontWeight: 'bold', marginRight: '10px' }}>
                    Search Radius:
                </label>
                <select
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    style={{ padding: '5px', borderRadius: '4px' }}
                >
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                    <option value={20}>20 km</option>
                    <option value={50}>50 km</option>
                </select>
                <div style={{ marginTop: '8px', fontSize: '0.9rem', color: '#666' }}>
                    Found {jobs.length} job{jobs.length !== 1 ? 's' : ''}
                </div>
            </div>

            {loading && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10,
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                }}>
                    Loading jobs...
                </div>
            )}

            <APIProvider apiKey={apiKey}>
                <Map
                    defaultZoom={11}
                    defaultCenter={userLocation}
                    mapId="jobnova-blue-collar-map"
                    style={{ width: '100%', height: '100%' }}
                >
                    {/* User Location Marker */}
                    <AdvancedMarker
                        position={userLocation}
                        title="Your Location"
                    >
                        <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: '#4f46e5',
                            borderRadius: '50%',
                            border: '3px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }} />
                    </AdvancedMarker>

                    {/* Job Markers */}
                    {jobs.map((job) => (
                        <AdvancedMarker
                            key={job.id}
                            position={{ lat: parseFloat(job.latitude), lng: parseFloat(job.longitude) }}
                            onClick={() => handleMarkerClick(job)}
                            title={job.title}
                        >
                            <div style={{
                                width: '30px',
                                height: '30px',
                                backgroundColor: '#10b981',
                                borderRadius: '50%',
                                border: '3px solid white',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                cursor: 'pointer'
                            }}>
                                💼
                            </div>
                        </AdvancedMarker>
                    ))}

                    {/* Info Window for Selected Job */}
                    {selectedJob && (
                        <InfoWindow
                            position={{
                                lat: parseFloat(selectedJob.latitude),
                                lng: parseFloat(selectedJob.longitude)
                            }}
                            onCloseClick={() => setSelectedJob(null)}
                        >
                            <div style={{ padding: '10px', maxWidth: '250px' }}>
                                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#4f46e5' }}>
                                    {selectedJob.title}
                                </h3>
                                <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                                    📍 {selectedJob.location}
                                </p>
                                {selectedJob.hourly_rate && (
                                    <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                                        💰 {selectedJob.hourly_rate}
                                    </p>
                                )}
                                {selectedJob.duration && (
                                    <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                                        ⏱ {selectedJob.duration}
                                    </p>
                                )}
                                <button
                                    onClick={() => handleApply(selectedJob.id)}
                                    style={{
                                        marginTop: '10px',
                                        padding: '8px 16px',
                                        backgroundColor: '#4f46e5',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        width: '100%'
                                    }}
                                >
                                    Apply Now
                                </button>
                            </div>
                        </InfoWindow>
                    )}
                </Map>
            </APIProvider>
        </div>
    );
};

export default MapView;
