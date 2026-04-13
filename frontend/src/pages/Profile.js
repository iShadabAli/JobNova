import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';
import StarRating from '../components/StarRating';
import VoiceProfileAssistant from '../components/VoiceProfileAssistant';

const Profile = ({ user, logout }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    const [hiringHistory, setHiringHistory] = useState([]);
    const [cvFile, setCvFile] = useState(null);
    const [uploadingCV, setUploadingCV] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Initial Profile State
    const [profile, setProfile] = useState({
        full_name: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'User',
        email: user?.email, // Computed, not stored in profile usually but nice to show
        phone: user?.phone || '',
        location: '',
        bio: '',
        avatar_url: '', // Explicitly track avatar

        // White Collar Specific
        skills: '',
        experience: '',
        education: '',

        // Blue Collar Specific
        trade: 'Electrician',
        hourly_rate: '',
        availability: '',
        radius: 10,

        // Employer Specific
        company_name: '',
        industry: '',
        website: '',

        // Ratings (Read Only)
        avg_rating: 0,
        total_reviews: 0
    });

    // Fetch Profile on Mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = sessionStorage.getItem('token'); // or localStorage
                const response = await fetch('http://localhost:5000/api/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data && data.profile) {
                        // Handle "not found" case which returns { message: ..., profile: ... } with minimal data
                        // In that case we just keep defaults or merge what we have
                    }
                    if (data.id) {
                        // Found a real profile
                        setProfile(prev => ({
                            ...prev,
                            ...data,
                            // Preserve full_name if DB has null/empty
                            full_name: data.full_name || prev.full_name,
                            // Handle array to string conversions if needed (e.g. skills)
                            skills: Array.isArray(data.skills) ? data.skills.join(', ') : data.skills || '',
                            trade: data.trade || 'Electrician',
                            avatar_url: data.avatar_url || ''
                        }));
                    }
                }
            } catch (err) {
                console.error("Error fetching profile", err);
                // Don't block UI on error, just show empty or defaults
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProfile();
            if (user.role === 'employer') {
                fetchHiringHistory();
            }
        }
    }, [user]);

    const fetchHiringHistory = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/profile/hiring-history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setHiringHistory(data);
            }
        } catch (err) {
            console.error("Error fetching hiring history", err);
        }
    };

    // Handle Input Change
    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/profile/upload-avatar', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                setProfile(prev => ({ ...prev, avatar_url: result.avatar_url }));
                toast.success('Profile picture updated successfully!');
            } else {
                throw new Error('Failed to upload avatar');
            }
        } catch (err) {
            toast(err.message);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            // Handle CV Upload if file exists
            if (cvFile && user?.role === 'white_collar') {
                setUploadingCV(true);
                const formData = new FormData();
                formData.append('cv', cvFile);

                const token = sessionStorage.getItem('token');
                const cvResponse = await fetch('http://localhost:5000/api/profile/upload-cv', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (cvResponse.ok) {
                    const cvResult = await cvResponse.json();

                    // Auto-fill extracted info if any exists, but keep user's manual inputs if they are already filled
                    setProfile(prev => ({
                        ...prev,
                        resume_url: cvResult.resume_url,
                        skills: prev.skills || cvResult.parsedData?.skills || '',
                        education: prev.education || cvResult.parsedData?.education || '',
                        experience: prev.experience || cvResult.parsedData?.experience || ''
                    }));

                    if (cvResult.parsedData && (cvResult.parsedData.skills || cvResult.parsedData.education || cvResult.parsedData.experience)) {
                        toast.success('CV Uploaded Successfully! We automatically extracted some information for you. Please review and save.');
                    } else {
                        toast.success('CV Uploaded Successfully!');
                    }

                } else {
                    toast.error('Failed to upload CV');
                }
                setUploadingCV(false);
                setCvFile(null); // Reset after upload attempt
            }

            const token = sessionStorage.getItem('token');

            // Create payload with ONLY valid profile table columns
            // Exclude: email, phone (from users table, not profiles)
            const payload = {
                full_name: profile.full_name,
                bio: profile.bio,
                location: profile.location,
                avatar_url: profile.avatar_url,
                // Blue collar fields
                trade: profile.trade,
                hourly_rate: profile.hourly_rate,
                availability: profile.availability,
                radius: profile.radius,
                // White collar fields
                skills: profile.skills,
                experience: profile.experience,
                education: profile.education,
                resume_url: profile.resume_url,
                // Employer fields
                company_name: profile.company_name,
                industry: profile.industry,
                website: profile.website
            };

            const response = await fetch('http://localhost:5000/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const result = await response.json();
            setProfile(prev => ({ ...prev, ...result.profile }));
            setIsEditing(false);
            toast.success('Profile Updated Successfully!');
        } catch (err) {
            toast.error('Error updating profile: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const navigate = useNavigate();

    if (loading && !profile.full_name) return <div className="p-4">Loading profile...</div>;

    return (
        <div className="wc-dashboard-container">
            {/* Navbar */}
            <nav className="wc-navbar">
                <div className="wc-nav-brand" style={{ color: '#4f46e5' }}>JobNova</div>

                {/* IMPROVED BACK BUTTON */}

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn-back-dashboard"
                        title="Back to Dashboard"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Dashboard
                    </button>


                <div className="wc-user-menu">
                    <span className="wc-user-greeting">{profile.full_name}</span>
                    <button onClick={logout} className="btn btn-outline-light btn-sm">Logout</button>
                </div>
            </nav>

            <main className="wc-main-content">
                {/* Profile Header */}
                <div className="profile-header">
                    <div className="profile-cover"></div>
                    <div className="profile-info-row">
                        <div className="profile-avatar">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile Avatar" />
                            ) : (
                                profile.full_name ? profile.full_name[0].toUpperCase() : 'U'
                            )}

                            {/* Hidden file input for Avatar upload */}
                            <input
                                type="file"
                                id="avatar-upload"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleAvatarUpload}
                            />
                            <label htmlFor="avatar-upload" className="avatar-upload-label">
                                {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
                            </label>
                        </div>
                        <div className="profile-text">
                            <h1>{profile.full_name}</h1>
                            <p className="role-badge">
                                {user?.role === 'white_collar' ? 'White Collar Professional' :
                                    user?.role === 'blue_collar' ? 'Skilled Worker' :
                                        user?.role === 'employer' ? 'Employer' : 'User'}
                            </p>
                            <p className="location-text">📍 {profile.location || 'Location not set'}</p>

                            {/* Rating Display */}
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px', gap: '8px' }}>
                                <StarRating rating={profile.avg_rating || 0} readOnly={true} size="20px" />
                                <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                                    {profile.avg_rating > 0 ? profile.avg_rating : 'New'} ({profile.total_reviews || 0} reviews)
                                </span>
                            </div>
                        </div>
                        <div className="profile-actions">
                            {isEditing ? (
                                <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            ) : (
                                <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>Edit Profile</button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="profile-grid">
                    {/* Left Column: Basic Info */}
                    <div className="profile-card">
                        <h3>Contact Information</h3>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                className="form-input"
                                name="full_name"
                                disabled={!isEditing}
                                value={profile.full_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input className="form-input" disabled value={user?.email || ''} />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input className="form-input" disabled value={user?.phone || ''} />
                            <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>Phone cannot be changed</small>
                        </div>
                        <div className="form-group">
                            <label>Location</label>
                            <input
                                className="form-input"
                                name="location"
                                disabled={!isEditing}
                                value={profile.location}
                                onChange={handleChange}
                                placeholder="City, Country"
                            />
                        </div>
                    </div>

                    {/* Right Column: Role Specifics */}
                    <div className="profile-card" style={{ flex: 2 }}>
                        <h3>{user?.role === 'employer' ? 'Company Details' : 'Professional Details'}</h3>

                        <div className="form-group">
                            <label>Bio / Summary</label>
                            <textarea
                                className="form-input"
                                name="bio"
                                rows="3"
                                disabled={!isEditing}
                                value={profile.bio}
                                onChange={handleChange}
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        {/* White Collar Fields */}
                        {user?.role === 'white_collar' && (
                            <>
                                <div className="form-group">
                                    <label>Skills (Comma Separated)</label>
                                    <input
                                        className="form-input"
                                        name="skills"
                                        disabled={!isEditing}
                                        value={profile.skills}
                                        onChange={handleChange}
                                        placeholder="React, Node.js, Design..."
                                    />
                                    {profile.skills && (
                                        <div className="skills-tags-preview">
                                            {profile.skills.split(',').map((skill, i) => (
                                                skill.trim() && <span key={i} className="wc-skill-tag">{skill.trim()}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Education</label>
                                    <input className="form-input" name="education" disabled={!isEditing} value={profile.education} onChange={handleChange} placeholder="Degree, University" />
                                </div>
                                <div className="form-group">
                                    <label>Experience</label>
                                    <input className="form-input" name="experience" disabled={!isEditing} value={profile.experience} onChange={handleChange} placeholder="e.g. 3 Years" />
                                </div>
                                <div className="form-group">
                                    <label>Resume Link / Portfolio</label>
                                    <input className="form-input" name="resume_url" disabled={!isEditing} value={profile.resume_url || ''} onChange={handleChange} placeholder="https://drive.google.com/..." />
                                </div>
                                <div className="form-group">
                                    <label>Upload CV (PDF/Doc)</label>
                                    {isEditing ? (
                                        <div className="file-upload-wrapper" style={{ position: 'relative', overflow: 'hidden', display: 'inline-block', width: '100%', marginBottom: '10px' }}>
                                            <input
                                                type="file"
                                                id="profile-cv-upload"
                                                className="form-input"
                                                accept=".pdf,.doc,.docx"
                                                onChange={(e) => setCvFile(e.target.files[0])}
                                                style={{ display: 'none' }}
                                            />
                                            <label
                                                htmlFor="profile-cv-upload"
                                                className="btn btn-outline-light"
                                                style={{
                                                    display: 'block',
                                                    width: '100%',
                                                    textAlign: 'center',
                                                    padding: '15px',
                                                    border: '2px dashed #4f46e5',
                                                    color: '#4f46e5',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    backgroundColor: '#f5f3ff',
                                                    borderRadius: '8px'
                                                }}
                                            >
                                                {cvFile ? `✅ Selected: ${cvFile.name}` : '📁 Click to Browse & Upload CV'}
                                            </label>
                                        </div>
                                    ) : (
                                        profile.resume_url ? (
                                            <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm" style={{ display: 'inline-block', marginTop: '5px' }}>
                                                📄 Download Current CV
                                            </a>
                                        ) : (
                                            <p style={{ color: '#666', fontSize: '14px' }}>No CV uploaded yet</p>
                                        )
                                    )}
                                    {uploadingCV && <small style={{ color: 'blue', display: 'block' }}>Uploading CV...</small>}
                                </div>
                            </>
                        )}

                        {/* Blue Collar Fields */}
                        {user?.role === 'blue_collar' && (
                            <>
                                {isEditing && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <VoiceProfileAssistant 
                                            profile={profile}
                                            onUpdateProfile={(updates) => setProfile(prev => ({...prev, ...updates}))}
                                        />
                                    </div>
                                )}
                                <div className="form-group">
                                    <label>Primary Trade</label>
                                    <select
                                        className="form-input"
                                        name="trade"
                                        disabled={!isEditing}
                                        value={profile.trade}
                                        onChange={handleChange}
                                    >
                                        <option value="Electrician">Electrician</option>
                                        <option value="Plumber">Plumber</option>
                                        <option value="Carpenter">Carpenter</option>
                                        <option value="Painter">Painter</option>
                                        <option value="Mason">Mason</option>
                                        <option value="Driver">Driver</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Hourly Rate (PKR)</label>
                                    <input
                                        className="form-input"
                                        name="hourly_rate"
                                        type="number"
                                        disabled={!isEditing}
                                        value={profile.hourly_rate}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Availability</label>
                                    <input
                                        className="form-input"
                                        name="availability"
                                        disabled={!isEditing}
                                        value={profile.availability}
                                        onChange={handleChange}
                                        placeholder="e.g. Mon-Fri, 9am-5pm"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Work Radius: {profile.radius || 10} km</label>
                                    <input
                                        type="range"
                                        className="form-input"
                                        name="radius"
                                        min="1"
                                        max="50"
                                        disabled={!isEditing}
                                        value={profile.radius || 10}
                                        onChange={handleChange}
                                        style={{ accentColor: '#4f46e5' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                                        <span>1 km</span>
                                        <span>50 km</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Employer Fields */}
                        {user?.role === 'employer' && (
                            <>
                                <div className="form-group">
                                    <label>Company Name</label>
                                    <input className="form-input" name="company_name" disabled={!isEditing} value={profile.company_name} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Industry</label>
                                    <input className="form-input" name="industry" disabled={!isEditing} value={profile.industry} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Website</label>
                                    <input className="form-input" name="website" disabled={!isEditing} value={profile.website} onChange={handleChange} />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Employer Hiring History Selection */}
                {user?.role === 'employer' && (
                    <div className="profile-grid" style={{ marginTop: '20px' }}>
                        <div className="profile-card" style={{ flex: 1 }}>
                            <h3>Hiring History</h3>
                            {hiringHistory.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Job Title</th>
                                                <th>Worker Hired</th>
                                                <th>Date Completed</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {hiringHistory.map(app => (
                                                <tr key={app.id}>
                                                    <td>{app.jobs?.title || 'Unknown Job'}</td>
                                                    <td>{app.worker_name}</td>
                                                    <td>{new Date(app.created_at).toLocaleDateString()}</td>
                                                    <td><span className="badge badge-success">Completed</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state text-center" style={{ padding: '20px', color: '#666' }}>
                                    <p>No completed hires yet. When you complete a job with a worker, it will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Profile;
