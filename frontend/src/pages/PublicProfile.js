import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../index.css';
import ComplaintModal from '../components/ComplaintModal';

const PublicProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showComplaintModal, setShowComplaintModal] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/profile/public/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.error || 'Failed to load profile');
                }
                const result = await response.json();
                setData(result);
            } catch (err) {
                console.error('Profile load error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchProfile();
    }, [userId]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
                <div style={{ margin: '0 auto 20px', width: '60px', height: '60px', border: '4px solid rgba(255,255,255,0.2)', borderTop: '4px solid white', borderRadius: '50%', animation: 'spin 1s cubic-bezier(0.55, 0.055, 0.675, 0.19) infinite' }}></div>
                <p style={{ fontSize: '1.2rem', fontWeight: 600, letterSpacing: '1px' }}>Loading Profile...</p>
            </div>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (error) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' }}>
            <div style={{ textAlign: 'center', padding: '50px 40px', background: 'white', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', maxWidth: '400px', width: '90%' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px', animation: 'bounce 2s infinite' }}>⚠️</div>
                <h2 style={{ color: '#1e293b', marginBottom: '12px', fontSize: '1.5rem', fontWeight: 800 }}>Profile Not Found</h2>
                <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: '30px' }}>{error}</p>
                <button onClick={() => navigate(-1)} style={{
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white',
                    padding: '14px 32px', borderRadius: '12px', border: 'none', fontSize: '1rem', fontWeight: 700, 
                    cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 10px 20px rgba(79,70,229,0.3)'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >← Go Back</button>
            </div>
            <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
        </div>
    );

    const { profile, reviews, jobs_posted, completed_jobs_count, user_info } = data || {};
    const fullName = profile?.full_name || `${user_info?.first_name || ''} ${user_info?.last_name || ''}`.trim() || 'User';
    const initials = fullName.split(' ').map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2);
    
    // Better role labels and colors
    const roleLabel = user_info?.role === 'employer' ? 'Employer' : user_info?.role === 'blue_collar' ? 'Blue Collar Worker' : user_info?.role === 'white_collar' ? 'Professional' : profile?.role || 'User';
    const roleColors = user_info?.role === 'employer' ? { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' } 
                     : user_info?.role === 'blue_collar' ? { bg: '#fef3c7', text: '#d97706', border: '#fde68a' } 
                     : { bg: '#e0e7ff', text: '#4338ca', border: '#c7d2fe' };

    const StarDisplay = ({ rating, size = '1.2rem' }) => (
        <span style={{ display: 'inline-flex', gap: '2px' }}>
            {[1, 2, 3, 4, 5].map(s => (
                <span key={s} style={{ 
                    color: s <= Math.round(rating || 0) ? '#fbbf24' : '#e2e8f0', 
                    fontSize: size,
                    textShadow: s <= Math.round(rating || 0) ? '0 2px 4px rgba(251,191,36,0.3)' : 'none'
                }}>★</span>
            ))}
        </span>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', 'Segoe UI', sans-serif", paddingBottom: '60px' }}>
            
            {/* ── Ultra-Premium Hero Header ── */}
            <div style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                padding: '30px 20px 160px', // Extra bottom padding for overlap
                position: 'relative',
                borderBottomLeftRadius: '40px',
                borderBottomRightRadius: '40px',
                overflow: 'hidden'
            }}>
                {/* Decorative background shapes */}
                <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '60%', height: '200%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', transform: 'rotate(30deg)' }}></div>
                <div style={{ position: 'absolute', bottom: '-20%', right: '-5%', width: '40%', height: '100%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }}></div>

                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: 'white',
                            padding: '12px 24px', borderRadius: '14px', cursor: 'pointer',
                            fontSize: '0.95rem', fontWeight: 600, backdropFilter: 'blur(12px)',
                            display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                        Back
                    </button>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button 
                            onClick={() => setShowComplaintModal(true)}
                            style={{ 
                                background: 'rgba(239, 68, 68, 0.2)', color: '#fee2e2', padding: '8px 16px', 
                                borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(239, 68, 68, 0.4)', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)'}
                            onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                        >
                            <span style={{ marginRight: '6px' }}>⚠️</span> Report User
                        </button>
                        <span style={{ 
                            background: 'rgba(0,0,0,0.2)', color: 'white', padding: '8px 16px', 
                            borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>Public Profile view</span>
                    </div>
                </div>
            </div>

            {/* ── Main Content Container ── */}
            <div style={{ maxWidth: '900px', margin: '-100px auto 0', padding: '0 20px', position: 'relative', zIndex: 20 }}>

                {/* ── Overlapping Identity Card ── */}
                <div style={{
                    background: 'rgba(255,255,255,0.95)', borderRadius: '28px', padding: '40px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.05)', 
                    marginBottom: '32px', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.5)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                    position: 'relative'
                }}>
                    {/* Floating Avatar */}
                    <div style={{ marginTop: '-80px', marginBottom: '20px' }}>
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt={fullName}
                                style={{ width: '130px', height: '130px', borderRadius: '50%', objectFit: 'cover', 
                                border: '6px solid white', boxShadow: '0 12px 32px rgba(79,70,229,0.25)', backgroundColor: 'white' }} />
                        ) : (
                            <div style={{
                                width: '130px', height: '130px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '3rem', fontWeight: 800, border: '6px solid white', 
                                boxShadow: '0 12px 32px rgba(79,70,229,0.25)'
                            }}>
                                {initials}
                            </div>
                        )}
                    </div>

                    <h1 style={{ margin: '0 0 12px', fontSize: '2.5rem', color: '#0f172a', fontWeight: 800, letterSpacing: '-0.5px' }}>{fullName}</h1>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px' }}>
                        <span style={{
                            background: roleColors.bg, color: roleColors.text, padding: '6px 20px',
                            borderRadius: '24px', fontSize: '0.9rem', fontWeight: 700, border: `1px solid ${roleColors.border}`,
                            boxShadow: `0 4px 12px ${roleColors.bg}80`
                        }}>
                            {roleLabel}
                        </span>
                        {profile?.role && profile.role !== roleLabel && (
                            <span style={{
                                background: '#f1f5f9', color: '#475569', padding: '6px 20px',
                                borderRadius: '24px', fontSize: '0.9rem', fontWeight: 600, border: '1px solid #e2e8f0'
                            }}>
                                {profile.role}
                            </span>
                        )}
                    </div>

                    {profile?.avg_rating && Number(profile.avg_rating) > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fafafb', padding: '10px 24px', borderRadius: '30px', border: '1px solid #f1f5f9', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                            <StarDisplay rating={profile.avg_rating} size="1.4rem" />
                            <span style={{ color: '#0f172a', fontSize: '1rem', fontWeight: 700 }}>
                                {Number(profile.avg_rating).toFixed(1)} 
                                <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.9rem', marginLeft: '6px' }}>({profile.total_reviews || 0} reviews)</span>
                            </span>
                        </div>
                    )}

                    {profile?.bio && (
                        <div style={{ marginTop: '30px', width: '100%', maxWidth: '700px' }}>
                            <p style={{ margin: 0, color: '#475569', lineHeight: 1.8, fontSize: '1.05rem' }}>"{profile.bio}"</p>
                        </div>
                    )}
                </div>

                {/* ── Floating Stats Grid ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    {[
                        { value: profile?.avg_rating ? Number(profile.avg_rating).toFixed(1) : '—', label: 'Rating', color: '#7c3aed', bg: '#f3e8ff', icon: '⭐' },
                        { value: profile?.total_reviews || 0, label: 'Reviews', color: '#059669', bg: '#dcfce7', icon: '💬' },
                        { value: (jobs_posted || []).length, label: 'Jobs Posted', color: '#d97706', bg: '#fef3c7', icon: '📋' },
                        { value: completed_jobs_count || 0, label: 'Completed', color: '#e11d48', bg: '#ffe4e6', icon: '✅' },
                    ].map((stat, i) => (
                        <div key={i} style={{
                            background: 'white', borderRadius: '24px', padding: '24px 20px', textAlign: 'center',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(255,255,255,0.8)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'default'
                        }}
                            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'; }}
                            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.03)'; }}
                        >
                            <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', background: stat.bg, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', transform: 'rotate(-5deg)' }}>{stat.icon}</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{stat.value}</div>
                            <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700, marginTop: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* ── Info Cards Grid ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    
                    {/* Contact Card */}
                    <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                            <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                            </div>
                            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', fontWeight: 800 }}>Contact Info</h3>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {(user_info?.phone || profile?.phone) && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '16px', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={e=>e.currentTarget.style.background='#f1f5f9'} onMouseOut={e=>e.currentTarget.style.background='#f8fafc'}>
                                    <div style={{ background: 'white', padding: '8px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                    </div>
                                    <a href={`tel:${user_info.phone || profile.phone}`} style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem' }}>
                                        {user_info.phone || profile.phone}
                                    </a>
                                </div>
                            )}
                            {profile?.location && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '16px' }}>
                                    <div style={{ background: 'white', padding: '8px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    </div>
                                    <span style={{ color: '#334155', fontWeight: 600, fontSize: '1.05rem' }}>{profile.location}</span>
                                </div>
                            )}
                            {profile?.company_name && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '16px' }}>
                                    <div style={{ background: 'white', padding: '8px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
                                    </div>
                                    <span style={{ color: '#334155', fontWeight: 700, fontSize: '1.05rem' }}>{profile.company_name}</span>
                                </div>
                            )}
                            {!user_info?.phone && !profile?.phone && !profile?.location && !profile?.company_name && (
                                <div style={{ padding: '30px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', color: '#94a3b8' }}>
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 10px', display: 'block' }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><line x1="22" y1="6" x2="2" y2="22" /></svg>
                                    <span>No contact details</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Professional Details Card */}
                    <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                            <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </div>
                            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', fontWeight: 800 }}>Expertise</h3>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {profile?.experience_years && (
                                <div>
                                    <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Years of Experience</span>
                                    <div style={{ display: 'inline-block', padding: '8px 20px', background: '#f8fafc', borderRadius: '12px', color: '#0f172a', fontWeight: 800, fontSize: '1.2rem', border: '1px solid #e2e8f0' }}>
                                        {profile.experience_years} <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Years</span>
                                    </div>
                                </div>
                            )}
                            {profile?.skills && (
                                <div>
                                    <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '12px' }}>Core Skills</span>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {profile.skills.split(',').map((skill, idx) => (
                                            <span key={idx} style={{
                                                background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', color: '#334155', padding: '8px 16px',
                                                borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                            }}>
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {!profile?.experience_years && !profile?.skills && (
                                <div style={{ padding: '30px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', color: '#94a3b8' }}>
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 10px', display: 'block' }}><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /><line x1="22" y1="6" x2="2" y2="22" /></svg>
                                    <span>No professional details</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Reviews Section ── */}
                <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                        <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                        </div>
                        <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', fontWeight: 800 }}>Client Reviews</h3>
                    </div>
                    
                    {(!reviews || reviews.length === 0) ? (
                        <div style={{ padding: '30px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', color: '#94a3b8' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 10px', display: 'block' }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            <span>No reviews yet</span>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {reviews.map((review, idx) => (
                                <div key={idx} style={{
                                    padding: '24px', background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden'
                                }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, #fbbf24, #f59e0b)' }}></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div>
                                            <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>{review.reviewer_name || 'Anonymous User'}</div>
                                            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>
                                                {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <div style={{ background: '#fffbeb', padding: '4px 8px', borderRadius: '10px' }}>
                                            <StarDisplay rating={review.rating} size="1rem" />
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p style={{ margin: '16px 0 0', color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                            "{review.comment}"
                                        </p>
                                    )}
                                    {review.jobs?.title && (
                                        <div style={{ marginTop: '16px', fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontWeight: 600 }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                                            {review.jobs.title}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Jobs Posted Section (for Employers) ── */}
                {jobs_posted && jobs_posted.length > 0 && (
                    <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                            <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                            </div>
                            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', fontWeight: 800 }}>Recent Job Postings</h3>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {jobs_posted.map(job => (
                                <div key={job.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
                                    padding: '20px 24px', background: '#f8fafc', borderRadius: '16px',
                                    border: '1px solid #e2e8f0', transition: 'all 0.2s', cursor: 'default'
                                }}
                                    onMouseOver={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'scale(1.01)'; }}
                                    onMouseOut={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', marginBottom: '6px' }}>{job.title}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                            {new Date(job.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <span style={{
                                            background: job.type === 'blue' ? '#eff6ff' : '#f5f3ff',
                                            color: job.type === 'blue' ? '#2563eb' : '#7c3aed',
                                            padding: '6px 16px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px'
                                        }}>
                                            {job.type === 'blue' ? 'Blue Collar' : 'White Collar'}
                                        </span>
                                        <span style={{
                                            background: job.status === 'Active' ? '#f0fdf4' : '#fef2f2',
                                            color: job.status === 'Active' ? '#16a34a' : '#dc2626',
                                            padding: '6px 16px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px',
                                            display: 'flex', alignItems: 'center', gap: '4px'
                                        }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: job.status === 'Active' ? '#16a34a' : '#dc2626' }}></div>
                                            {job.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <ComplaintModal 
                isOpen={showComplaintModal}
                onClose={() => setShowComplaintModal(false)}
                type="user"
                reportedUserId={userId}
                targetName={fullName}
            />
        </div>
    );
};

export default PublicProfile;
