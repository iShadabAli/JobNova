import React from 'react';
import '../index.css';

const ProfileModal = ({ profile, onClose, userType = 'Profile', isRtl = false }) => {
    if (!profile) return null;

    const initials = profile.full_name ? profile.full_name.charAt(0).toUpperCase() : (profile.company_name ? profile.company_name.charAt(0).toUpperCase() : 'U');

    return (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
            <div className="modal-content" style={{ maxWidth: '500px', width: '90%' }} dir={isRtl ? 'rtl' : 'ltr'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#4f46e5', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold'
                        }}>
                            {initials}
                        </div>
                        <div>
                            <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem' }}>{profile.full_name || 'Anonymous User'}</h2>
                            <span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-block', marginTop: '5px' }}>
                                {userType}
                            </span>
                        </div>
                    </div>
                    <button className="btn-text" onClick={onClose} style={{ fontSize: '1.5rem', padding: '0 5px', color: '#64748b', cursor: 'pointer', border: 'none', background: 'none' }}>×</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {profile.company_name && (
                        <div>
                            <strong style={{ color: '#475569', display: 'block', marginBottom: '5px' }}>Company</strong>
                            <div style={{ color: '#1e293b' }}>🏢 {profile.company_name}</div>
                        </div>
                    )}

                    {profile.phone && (
                        <div>
                            <strong style={{ color: '#475569', display: 'block', marginBottom: '5px' }}>Phone Number</strong>
                            <div style={{ color: '#1e293b' }}>
                                📞 <a href={`tel:${profile.phone}`} style={{ color: '#4f46e5', textDecoration: 'none' }}>{profile.phone}</a>
                            </div>
                        </div>
                    )}

                    {profile.location && (
                        <div>
                            <strong style={{ color: '#475569', display: 'block', marginBottom: '5px' }}>Location</strong>
                            <div style={{ color: '#1e293b' }}>📍 {profile.location}</div>
                        </div>
                    )}

                    {profile.experience_years && (
                        <div>
                            <strong style={{ color: '#475569', display: 'block', marginBottom: '5px' }}>Experience</strong>
                            <div style={{ color: '#1e293b' }}>⏳ {profile.experience_years} Years</div>
                        </div>
                    )}

                    {profile.skills && (
                        <div>
                            <strong style={{ color: '#475569', display: 'block', marginBottom: '5px' }}>Skills</strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {profile.skills.split(',').map((skill, index) => (
                                    <span key={index} style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
                                        {skill.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {profile.bio && (
                        <div>
                            <strong style={{ color: '#475569', display: 'block', marginBottom: '5px' }}>About</strong>
                            <div style={{ color: '#1e293b', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', lineHeight: '1.5' }}>
                                {profile.bio}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Close Profile</button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
