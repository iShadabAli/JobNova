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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0f172a' }}>
            <div style={{ textAlign: 'center', color: '#f8fafc' }}>
                <div style={{ margin: '0 auto 20px', width: '50px', height: '50px', border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ fontSize: '1.1rem', fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase', color: '#94a3b8' }}>Loading Profile</p>
            </div>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (error) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0f172a' }}>
            <div style={{ textAlign: 'center', padding: '60px 40px', background: 'rgba(30,41,59,0.5)', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', maxWidth: '400px', width: '90%' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>⚠️</div>
                <h2 style={{ color: '#f8fafc', marginBottom: '10px', fontSize: '1.5rem', fontWeight: 700 }}>Profile Not Found</h2>
                <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '30px' }}>{error}</p>
                <button onClick={() => navigate(-1)} style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white',
                    padding: '12px 28px', borderRadius: '12px', border: 'none', fontSize: '0.95rem', fontWeight: 600, 
                    cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 8px 20px rgba(99,102,241,0.25)'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >← Go Back</button>
            </div>
        </div>
    );

    const { profile, reviews, jobs_posted, completed_jobs_count, user_info } = data || {};
    const fullName = profile?.full_name || `${user_info?.first_name || ''} ${user_info?.last_name || ''}`.trim() || 'User';
    const initials = fullName.split(' ').map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2);
    
    const roleLabel = user_info?.role === 'employer' ? 'Employer' : user_info?.role === 'blue_collar' ? 'Blue Collar Worker' : user_info?.role === 'white_collar' ? 'Professional' : profile?.role || 'User';
    const roleColors = user_info?.role === 'employer' ? { bg: 'rgba(16,185,129,0.1)', text: '#10b981', border: 'rgba(16,185,129,0.2)' } 
                     : user_info?.role === 'blue_collar' ? { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', border: 'rgba(245,158,11,0.2)' } 
                     : { bg: 'rgba(99,102,241,0.1)', text: '#818cf8', border: 'rgba(99,102,241,0.2)' };

    const StarDisplay = ({ rating, size = '1.2rem' }) => (
        <span style={{ display: 'inline-flex', gap: '2px' }}>
            {[1, 2, 3, 4, 5].map(s => (
                <span key={s} style={{ 
                    color: s <= Math.round(rating || 0) ? '#fbbf24' : 'rgba(255,255,255,0.1)', 
                    fontSize: size,
                    textShadow: s <= Math.round(rating || 0) ? '0 0 10px rgba(251,191,36,0.4)' : 'none'
                }}>★</span>
            ))}
        </span>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: "'Inter', 'Segoe UI', sans-serif", paddingBottom: '80px', color: '#f8fafc', overflowX: 'hidden' }}>
            
            {/* Dynamic Background */}
            <div style={{ position: 'fixed', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.15) 0%, transparent 60%)', zIndex: 0, pointerEvents: 'none' }}></div>
            
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', position: 'relative', zIndex: 10 }}>
                
                {/* ── Header Navigation ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0',
                            padding: '10px 20px', borderRadius: '12px', cursor: 'pointer',
                            fontSize: '0.9rem', fontWeight: 500, backdropFilter: 'blur(10px)',
                            display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s'
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#e2e8f0'; }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                        Back to platform
                    </button>
                    
                    <button 
                        onClick={() => setShowComplaintModal(true)}
                        style={{ 
                            background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '8px 16px', 
                            borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600,
                            border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer', transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.color = '#fef2f2'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#fca5a5'; }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        Report Profile
                    </button>
                </div>

                {/* ── Profile Identity Section ── */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '60px', textAlign: 'center' }}>
                    <div style={{ position: 'relative', marginBottom: '25px' }}>
                        <div style={{ 
                            position: 'absolute', top: '-10px', left: '-10px', right: '-10px', bottom: '-10px', 
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)', borderRadius: '50%', 
                            filter: 'blur(20px)', opacity: 0.5, zIndex: -1 
                        }}></div>
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt={fullName}
                                style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', 
                                border: '4px solid #1e293b', background: '#1e293b' }} />
                        ) : (
                            <div style={{
                                width: '150px', height: '150px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                                color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '3.5rem', fontWeight: 800, border: '4px solid #334155'
                            }}>
                                {initials}
                            </div>
                        )}
                        {profile?.verification_status === 'verified' && (
                            <div style={{ position: 'absolute', bottom: '5px', right: '5px', background: '#0f172a', borderRadius: '50%', padding: '2px' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C12 2 14.5 1 17 3C19.5 5 19 8 19 8C19 8 22 10 21 13C20 16 17 17 17 17C17 17 16 20 13 21C10 22 8 19 8 19C8 19 5 21 3 19C1 17 2 14 2 14C2 14 0 11 1 8C2 5 5 5 5 5C5 5 6 2 9 2C11.5 2 12 2 12 2Z" fill="#3b82f6"/>
                                    <path d="M16 9L10.5 14.5L8 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        )}
                    </div>

                    <h1 style={{ margin: '0 0 15px', fontSize: '3rem', fontWeight: 800, letterSpacing: '-1px', color: '#f8fafc' }}>
                        {fullName}
                    </h1>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '25px' }}>
                        <span style={{
                            background: roleColors.bg, color: roleColors.text, padding: '8px 24px',
                            borderRadius: '30px', fontSize: '0.95rem', fontWeight: 600, border: `1px solid ${roleColors.border}`
                        }}>
                            {roleLabel}
                        </span>
                        {profile?.role && profile.role !== roleLabel && (
                            <span style={{
                                background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '8px 24px',
                                borderRadius: '30px', fontSize: '0.95rem', fontWeight: 500, border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                {profile.role}
                            </span>
                        )}
                    </div>

                    {profile?.avg_rating && Number(profile.avg_rating) > 0 && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'rgba(15,23,42,0.6)', padding: '12px 24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                            <StarDisplay rating={profile.avg_rating} size="1.3rem" />
                            <span style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 700 }}>
                                {Number(profile.avg_rating).toFixed(1)} 
                                <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.9rem', marginLeft: '8px' }}>({profile.total_reviews || 0} reviews)</span>
                            </span>
                        </div>
                    )}

                    {profile?.bio && (
                        <div style={{ marginTop: '30px', maxWidth: '800px' }}>
                            <p style={{ margin: 0, color: '#94a3b8', lineHeight: 1.8, fontSize: '1.1rem', fontStyle: 'italic' }}>"{profile.bio}"</p>
                        </div>
                    )}
                </div>

                {/* ── Stats Highlights ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    {[
                        { value: profile?.avg_rating ? Number(profile.avg_rating).toFixed(1) : '—', label: 'Overall Rating', color: '#8b5cf6' },
                        { value: profile?.total_reviews || 0, label: 'Total Reviews', color: '#10b981' },
                        { value: (jobs_posted || []).length, label: 'Jobs Posted', color: '#f59e0b', show: user_info?.role === 'employer' },
                        { value: completed_jobs_count || 0, label: 'Completed Jobs', color: '#ec4899', show: user_info?.role === 'employer' || user_info?.role === 'blue_collar' },
                    ].filter(s => s.show !== false).map((stat, i) => (
                        <div key={i} style={{
                            background: 'linear-gradient(180deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.8) 100%)', 
                            borderRadius: '24px', padding: '30px 20px', textAlign: 'center',
                            border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)'
                        }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: stat.color, marginBottom: '8px', lineHeight: 1 }}>{stat.value}</div>
                            <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* ── Detailed Info Grid ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                    
                    {/* Contact & Location */}
                    <div style={{ background: 'rgba(30,41,59,0.5)', borderRadius: '30px', padding: '35px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ margin: '0 0 25px', color: '#f8fafc', fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: '#6366f1' }}>#</span> About
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {(user_info?.phone || profile?.phone) && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'rgba(99,102,241,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '1px' }}>Phone</div>
                                        <a href={`tel:${user_info.phone || profile.phone}`} style={{ color: '#f8fafc', textDecoration: 'none', fontWeight: 600, fontSize: '1.05rem' }}>{user_info.phone || profile.phone}</a>
                                    </div>
                                </div>
                            )}
                            {profile?.location && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'rgba(236,72,153,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f472b6' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '1px' }}>Location</div>
                                        <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '1.05rem' }}>{profile.location}</div>
                                    </div>
                                </div>
                            )}
                            {profile?.company_name && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'rgba(16,185,129,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path></svg>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '1px' }}>Company</div>
                                        <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '1.05rem' }}>{profile.company_name}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Professional Info */}
                    <div style={{ background: 'rgba(30,41,59,0.5)', borderRadius: '30px', padding: '35px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ margin: '0 0 25px', color: '#f8fafc', fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: '#6366f1' }}>#</span> Professional
                        </h3>
                        {profile?.experience_years && (
                            <div style={{ marginBottom: '25px' }}>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Experience</div>
                                <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.5rem' }}>{profile.experience_years} <span style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500 }}>Years</span></div>
                            </div>
                        )}
                        {profile?.skills && (
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Skills</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {profile.skills.split(',').map((skill, idx) => (
                                        <span key={idx} style={{
                                            background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', padding: '8px 16px',
                                            borderRadius: '12px', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {!profile?.experience_years && !profile?.skills && (
                            <div style={{ color: '#64748b', fontStyle: 'italic' }}>No professional details provided.</div>
                        )}
                    </div>
                </div>

                {/* ── Reviews Grid ── */}
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ margin: '0 0 25px', color: '#f8fafc', fontSize: '1.6rem', fontWeight: 800 }}>Client Reviews</h3>
                    {(!reviews || reviews.length === 0) ? (
                        <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(30,41,59,0.3)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)', color: '#64748b' }}>
                            No reviews yet for this user.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                            {reviews.map((review, idx) => (
                                <div key={idx} style={{
                                    padding: '25px', background: 'rgba(30,41,59,0.5)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)',
                                    transition: 'transform 0.2s', cursor: 'default'
                                }} onMouseOver={e=>e.currentTarget.style.transform='translateY(-5px)'} onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                        <div>
                                            <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>{review.reviewer_name || 'Anonymous User'}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{new Date(review.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ background: 'rgba(251,191,36,0.1)', padding: '4px 10px', borderRadius: '12px' }}>
                                            <StarDisplay rating={review.rating} size="0.9rem" />
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p style={{ margin: '0', color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6 }}>"{review.comment}"</p>
                                    )}
                                    {review.jobs?.title && (
                                        <div style={{ marginTop: '20px', fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                                            {review.jobs.title}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Job Postings ── */}
                {user_info?.role === 'employer' && jobs_posted && jobs_posted.length > 0 && (
                    <div>
                        <h3 style={{ margin: '0 0 25px', color: '#f8fafc', fontSize: '1.6rem', fontWeight: 800 }}>Recent Postings</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {jobs_posted.map(job => (
                                <div key={job.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px',
                                    padding: '20px 30px', background: 'rgba(30,41,59,0.5)', borderRadius: '24px',
                                    border: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s'
                                }} onMouseOver={e=>e.currentTarget.style.background='rgba(30,41,59,0.8)'} onMouseOut={e=>e.currentTarget.style.background='rgba(30,41,59,0.5)'}>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1.15rem', marginBottom: '8px' }}>{job.title}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#94a3b8' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                            {new Date(job.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <span style={{
                                            background: job.type === 'blue' ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)',
                                            color: job.type === 'blue' ? '#60a5fa' : '#a78bfa',
                                            padding: '8px 16px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px'
                                        }}>
                                            {job.type === 'blue' ? 'Blue Collar' : 'White Collar'}
                                        </span>
                                        <span style={{
                                            background: job.status === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                            color: job.status === 'Active' ? '#34d399' : '#f87171',
                                            padding: '8px 16px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
                                            display: 'flex', alignItems: 'center', gap: '6px'
                                        }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: job.status === 'Active' ? '#34d399' : '#f87171' }}></div>
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
