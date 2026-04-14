import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';
import StarRating from '../components/StarRating';
import JobMap from '../components/JobMap';
import NotificationBell from '../components/NotificationBell';
import ComplaintModal from '../components/ComplaintModal';
import ChatWidget from '../components/ChatWidget';

const EmployerDashboard = ({ user, logout }) => {
    const [hiringMode, setHiringMode] = useState('white'); // 'white' or 'blue'
    const [showPostJob, setShowPostJob] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [profileName, setProfileName] = useState('');

    const [newJob, setNewJob] = useState({
        title: '',
        location: '',
        salary: '',
        duration: '',
        skills: '',
        latitude: null,
        longitude: null
    });

    const [showComplaintModal, setShowComplaintModal] = useState(false);

    // Fetch Jobs from API
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/jobs/my-jobs', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setJobs(data);
                }
            } catch (error) {
                console.error('Failed to fetch jobs:', error);
            }
        };

        const fetchProfile = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const res = await fetch('http://localhost:5000/api/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.full_name) {
                        setProfileName(data.full_name);
                    }
                }
            } catch (error) {
                console.error('Error fetching profile', error);
            }
        };

        fetchJobs();
        fetchProfile();
    }, [newJob]); // Reload jobs when a new job is posted


    const handlePostJob = async (e) => {
        e.preventDefault();
        try {
            const token = sessionStorage.getItem('token');
            const jobData = {
                title: newJob.title,
                description: '',
                type: hiringMode,
                location: newJob.location,
                salary_range: hiringMode === 'white' ? newJob.salary : null,
                hourly_rate: hiringMode === 'blue' ? newJob.salary : null,
                duration: hiringMode === 'blue' ? newJob.duration : null,
                skills: hiringMode === 'white' ? newJob.skills : null,
                latitude: hiringMode === 'blue' ? newJob.latitude : null,
                longitude: hiringMode === 'blue' ? newJob.longitude : null
            };

            const response = await fetch('http://localhost:5000/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(jobData)
            });

            if (response.ok) {
                const { job } = await response.json();
                setJobs([job, ...jobs]);
                setShowPostJob(false);
                setNewJob({ title: '', location: '', salary: '', duration: '', skills: '', latitude: null, longitude: null });
                toast.success(`${hiringMode === 'white' ? 'Permanent' : 'Short-term'} Job Posted Successfully!`);
            } else {
                toast.error('Failed to post job');
            }
        } catch (error) {
            console.error('Error posting job:', error);
            toast.error('Error posting job');
        }
    };

    const filteredJobs = jobs.filter(job => job.type === hiringMode);

    const [selectedJob, setSelectedJob] = useState(null);

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setJobs(jobs.filter(job => job.id !== jobId));
                toast.success('Job deleted successfully');
            } else {
                const err = await response.json();
                toast.error(err.error || 'Failed to delete job');
            }
        } catch (error) {
            console.error('Error deleting job:', error);
            toast.error('Error deleting job');
        }
    };

    const [applicants, setApplicants] = useState([]);
    const [loadingApps, setLoadingApps] = useState(false);
    const [chatError, setChatError] = useState(null);

    const navigate = useNavigate();

    const handleStartChat = async (jobId, candidateId) => {
        setChatError(null);
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/chat/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ job_id: jobId, candidate_id: candidateId })
            });
            if (res.ok) {
                const data = await res.json();
                window.dispatchEvent(new CustomEvent('open-chat', { detail: { session: data.session } }));
            } else {
                const err = await res.json();
                setChatError(err.message || 'Failed to start chat. Please make sure your profile is complete.');
            }
        } catch (error) {
            console.error("Failed to start chat", error);
            setChatError('Network error connecting to chat server. Please check your connection.');
        }
    };

    const handleManageJob = async (job) => {
        setSelectedJob(job);
        setLoadingApps(true);
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/jobs/${job.id}/applications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setApplicants(data);
            }
        } catch (error) {
            console.error('Error fetching applicants:', error);
        } finally {
            setLoadingApps(false);
        }
    };

    const handleStatusUpdate = async (appId, newStatus) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/jobs/applications/${appId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                toast.success(`Status updated to ${newStatus}`);
                // Update local state
                setApplicants(applicants.map(app =>
                    app.id === appId ? { ...app, status: newStatus } : app
                ));
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingData, setRatingData] = useState({ rating: 5, comment: '', app: null });

    const openRatingModal = (app) => {
        setRatingData({ rating: 5, comment: '', app });
        setShowRatingModal(true);
    };

    const handleSubmitReview = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    job_id: ratingData.app.job_id,
                    reviewee_id: ratingData.app.applicant_id,
                    rating: ratingData.rating,
                    comment: ratingData.comment
                })
            });

            if (response.ok) {
                toast.success('Review submitted successfully!');
                setShowRatingModal(false);
            } else {
                const err = await response.json();
                toast.error(err.error || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    const getDisplayName = () => {
        if (user?.first_name) return user.first_name;
        if (profileName) return profileName;
        if (user?.email) {
            const namePart = user.email.split('@')[0];
            return namePart.charAt(0).toUpperCase() + namePart.slice(1);
        }
        return user?.phone || 'Recruiter';
    };

    return (
        <div className="wc-dashboard-container">
            {/* Navbar */}
            <nav className="wc-navbar">
                <div className="wc-nav-brand" style={{ color: '#4f46e5' }}>JobNova Recruiter</div>
                <div className="wc-nav-links">
                    <a href="#overview" className="active">Overview</a>
                    <a href="#jobs">My Jobs</a>
                    <a href="/profile">My Profile</a>
                </div>
                <div className="wc-user-menu" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <NotificationBell language="en" />
                    <span className="wc-user-greeting">{getDisplayName()}</span>
                    <button onClick={logout} className="btn btn-outline-light btn-sm">Logout</button>
                    <button
                        onClick={() => setShowComplaintModal(true)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px'
                        }}
                        title="Report Issue"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </nav>

            <main className="wc-main-content">
                {/* Mode Switcher */}
                <div className="mode-switcher-container">
                    <button
                        className={`mode-btn ${hiringMode === 'blue' ? 'active blue' : ''}`}
                        onClick={() => setHiringMode('blue')}
                    >
                        <span className="icon">🛠️</span>
                        <div className="text">
                            <span className="title">Hire Blue-Collar</span>
                            <span className="subtitle">Short-term, Hourly, Nearby</span>
                        </div>
                    </button>
                    <button
                        className={`mode-btn ${hiringMode === 'white' ? 'active white' : ''}`}
                        onClick={() => setHiringMode('white')}
                    >
                        <span className="icon">👔</span>
                        <div className="text">
                            <span className="title">Hire White-Collar</span>
                            <span className="subtitle">Permanent, Skilled, CVs</span>
                        </div>
                    </button>
                </div>

                {/* Dashboard Content based on Mode */}
                <div className={`dashboard-section ${hiringMode}`}>
                    <div className="emp-actions-row">
                        <h2>{hiringMode === 'white' ? 'Active Listings' : 'Open Tasks'}</h2>
                        <button className="btn btn-primary" onClick={() => setShowPostJob(true)}>
                            + {hiringMode === 'white' ? 'Post Permanent Job' : 'Find Workers Now'}
                        </button>
                    </div>

                    {/* Stats Row */}
                    <div id="overview" className="emp-stats-grid">
                        <div className="emp-stat-card">
                            <h3>{hiringMode === 'white' ? 'Active Jobs' : 'Active Tasks'}</h3>
                            <p className="stat-number">{filteredJobs.filter(j => j.status === 'Active').length}</p>
                        </div>
                        <div className="emp-stat-card">
                            <h3>{hiringMode === 'white' ? 'Total Applicants' : 'Nearby Workers'}</h3>
                            <p className="stat-number">
                                {filteredJobs.reduce((total, job) => total + (job.applications?.[0]?.count || 0), 0)}
                            </p>
                        </div>
                        <div className="emp-stat-card">
                            <h3>{hiringMode === 'white' ? 'Interviews' : 'In Progress'}</h3>
                            <p className="stat-number">
                                {/* For a real app, this requires fetching all app statuses, but we'll show a placeholder or calculate if we had global apps fetched */}
                                {hiringMode === 'white' ? '--' : '--'}
                            </p>
                        </div>
                    </div>

                    {/* Job Table */}
                    <div id="jobs" className="emp-table-container" style={{ scrollMarginTop: '80px' }}>
                        <table className="emp-job-table">
                            <thead>
                                <tr>
                                    <th>{hiringMode === 'white' ? 'Role Title' : 'Task Name'}</th>
                                    <th>Location</th>
                                    <th>{hiringMode === 'white' ? 'Salary' : 'Rate'}</th>
                                    <th>{hiringMode === 'white' ? 'Applicants' : 'Status'}</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredJobs.map(job => (
                                    <tr key={job.id}>
                                        <td className="font-bold">{job.title}</td>
                                        <td>{job.location}</td>
                                        <td>{job.salary_range || job.hourly_rate}</td>
                                        <td>
                                            {hiringMode === 'white'
                                                ? `${job.applicants} Candidates`
                                                : <span className={`status-dot ${job.status === 'Active' ? 'dot-green' : 'dot-red'}`}></span>
                                            }
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn btn-primary btn-sm" onClick={() => handleManageJob(job)}>Manage</button>
                                                <button className="btn btn-danger btn-sm" style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }} onClick={() => handleDeleteJob(job.id)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredJobs.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8' }}>
                                            No {hiringMode === 'white' ? 'job listings' : 'tasks'} found. Post one to get started!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Post Job Modal (Dynamic) */}
                {showPostJob && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>
                                {hiringMode === 'white' ? 'Post Permanent Role' : 'Post Short-term Task'}
                            </h2>
                            <form onSubmit={handlePostJob}>
                                <div className="form-group">
                                    <label>{hiringMode === 'white' ? 'Job Title' : 'Task Name'}</label>
                                    <input
                                        className="form-input"
                                        required
                                        value={newJob.title}
                                        onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                                        placeholder={hiringMode === 'white' ? "e.g. Senior Accountant" : "e.g. Fix Leaking Tap"}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Location {hiringMode === 'blue' && '(Pin Address on Map below)'}</label>
                                    <input
                                        className="form-input"
                                        required
                                        value={newJob.location}
                                        onChange={e => setNewJob({ ...newJob, location: e.target.value })}
                                        placeholder="City or Address Description"
                                    />
                                </div>

                                {hiringMode === 'blue' && (
                                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                                        <label>Drop Pin for Location</label>
                                        <JobMap
                                            readOnly={false}
                                            onLocationSelect={(lat, lng) => setNewJob({ ...newJob, latitude: lat, longitude: lng })}
                                        />
                                        {(!newJob.latitude || !newJob.longitude) && (
                                            <small style={{ color: '#ef4444', display: 'block', marginTop: '0.5rem' }}>* Please click on the map to set the exact location.</small>
                                        )}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>{hiringMode === 'white' ? 'Salary Range' : 'Hourly Rate'}</label>
                                        <input
                                            className="form-input"
                                            required
                                            value={newJob.salary}
                                            onChange={e => setNewJob({ ...newJob, salary: e.target.value })}
                                            placeholder={hiringMode === 'white' ? "e.g. 50k - 80k" : "e.g. 500/hr"}
                                        />
                                    </div>
                                    {hiringMode === 'blue' && (
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label>Duration</label>
                                            <input
                                                className="form-input"
                                                required
                                                value={newJob.duration}
                                                onChange={e => setNewJob({ ...newJob, duration: e.target.value })}
                                                placeholder="e.g. 2 hours"
                                            />
                                        </div>
                                    )}
                                </div>

                                {hiringMode === 'white' && (
                                    <div className="form-group">
                                        <label>Required Skills</label>
                                        <input
                                            className="form-input"
                                            value={newJob.skills}
                                            onChange={e => setNewJob({ ...newJob, skills: e.target.value })}
                                            placeholder="e.g. Excel, React, Management"
                                        />
                                    </div>
                                )}

                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowPostJob(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">
                                        {hiringMode === 'white' ? 'Post Listing' : 'Find Workers'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Manage Applicants Modal */}
                {selectedJob && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '800px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{hiringMode === 'white' ? 'Manage Applicants' : 'Nearby Workers'}</h2>
                                <button
                                    onClick={() => { setSelectedJob(null); setChatError(null); }}
                                    style={{
                                        color: '#64748b',
                                        background: '#f1f5f9',
                                        border: '1px solid #e2e8f0',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.transform = 'rotate(90deg)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'rotate(0deg)'; }}
                                    aria-label="Close"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, color: '#1e293b' }}>{selectedJob.title}</h3>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span>{selectedJob.location} • {selectedJob.salary_range || selectedJob.hourly_rate}</span>
                                    {hiringMode === 'blue' && (selectedJob.latitude || selectedJob.location) && (
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${selectedJob.latitude && selectedJob.longitude ? `${selectedJob.latitude},${selectedJob.longitude}` : encodeURIComponent(selectedJob.location)}`}
                                            target="_blank" rel="noopener noreferrer"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', border: '1px solid #bfdbfe' }}
                                        >
                                            {selectedJob.latitude && selectedJob.longitude ? '📍 View Exact Pin' : '🗺️ Search by Address'}
                                        </a>
                                    )}
                                </p>
                            </div>

                            {/* Chat Error Notification */}
                            {chatError && (
                                <div style={{
                                    padding: '12px 20px',
                                    backgroundColor: '#fee2e2',
                                    borderLeft: '4px solid #ef4444',
                                    color: '#b91c1c',
                                    borderRadius: '4px',
                                    marginBottom: '20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                        <strong>Chat Error:</strong> {chatError}
                                    </div>
                                    <button
                                        onClick={() => setChatError(null)}
                                        style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontSize: '1.2rem' }}
                                    >×</button>
                                </div>
                            )}

                            <table className="emp-job-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Experience</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingApps ? (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Loading applicants...</td></tr>
                                    ) : applicants.length === 0 ? (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No applicants yet.</td></tr>
                                    ) : (
                                        applicants.map(app => (
                                            <tr key={app.id}>
                                                <td style={{ fontWeight: 600 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {app.applicant_name}
                                                        {app.applicant_profile?.avg_rating > 0 && (
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fffbeb', color: '#d97706', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #fde68a' }}>
                                                                ⭐ {Number(app.applicant_profile.avg_rating).toFixed(1)} <span style={{ color: '#b45309', fontWeight: 500 }}>({app.applicant_profile.total_reviews})</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    {hiringMode === 'blue' && app.applicant_profile?.phone && (
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>
                                                            📞 {app.applicant_profile.phone}
                                                        </div>
                                                    )}
                                                    <div style={{ marginTop: '5px' }}>
                                                        <button
                                                            className="btn-text"
                                                            style={{ fontSize: '0.8rem', color: '#4f46e5', textDecoration: 'none', padding: 0, display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', background: 'none', border: 'none' }}
                                                            onClick={() => navigate(`/profile/${app.applicant_id}`)}
                                                        >
                                                            <span style={{ background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                                            </span>
                                                            View Full Profile
                                                        </button>
                                                    </div>
                                                </td>
                                                <td>{app.applicant_profile?.experience_years ? `${app.applicant_profile.experience_years} Years` : 'N/A'}</td>
                                                <td>
                                                    <span className={`badge ${app.status === 'Completed' ? 'badge-green' :
                                                        app.status === 'In Progress' ? 'badge-blue' :
                                                            app.status === 'Offered' ? 'badge-purple' :
                                                                app.status === 'Shortlisted' ? 'badge-blue' :
                                                                    app.status === 'Rejected' ? 'badge-gray' :
                                                                        'badge-gray'
                                                        }`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                        {/* Profile / Contact actions */}
                                                        {hiringMode === 'white' && (
                                                            <button
                                                                className="btn btn-primary btn-sm"
                                                                onClick={() => window.open(app.resume_url || '#', '_blank')}
                                                                disabled={!app.resume_url}
                                                                title={!app.resume_url ? "No CV provided" : "View CV"}
                                                            >
                                                                {app.resume_url ? '📄 View CV' : 'No CV'}
                                                            </button>
                                                        )}
                                                        <button
                                                            className="chat-btn"
                                                            onClick={() => handleStartChat(selectedJob.id, app.applicant_id)}
                                                        >
                                                            💬 Message
                                                        </button>

                                                        {/* Status Update Actions */}
                                                        {app.status === 'Pending' && (
                                                            <>
                                                                <button
                                                                    className="btn btn-primary btn-sm"
                                                                    onClick={() => handleStatusUpdate(app.id, hiringMode === 'white' ? 'Shortlisted' : 'Offered')}
                                                                >
                                                                    {hiringMode === 'white' ? 'Shortlist' : 'Send Offer'}
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger btn-sm"
                                                                    style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}
                                                                    onClick={() => handleStatusUpdate(app.id, 'Rejected')}
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}

                                                        {app.status === 'In Progress' && (
                                                            <button
                                                                className="btn btn-primary btn-sm"
                                                                style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                                                                onClick={() => handleStatusUpdate(app.id, 'Completed')}
                                                            >
                                                                Mark Completed
                                                            </button>
                                                        )}

                                                        {app.status === 'Completed' && (
                                                            <button
                                                                className="btn btn-outline-light btn-sm"
                                                                style={{ color: '#fbbf24', borderColor: '#fbbf24' }}
                                                                onClick={() => openRatingModal(app)}
                                                            >
                                                                ★ Rate Worker
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {/* Rating Modal */}
                {showRatingModal && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '500px' }}>
                            <h2>Rate Worker</h2>
                            <p style={{ marginBottom: '1rem', color: '#666' }}>
                                How was your experience with <strong>{ratingData.app?.applicant_name}</strong>?
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <StarRating
                                    rating={ratingData.rating}
                                    onChange={(r) => setRatingData({ ...ratingData, rating: r })}
                                    size="40px"
                                />
                            </div>

                            <div className="form-group">
                                <label>Comment (Optional)</label>
                                <textarea
                                    className="form-input"
                                    rows="3"
                                    value={ratingData.comment}
                                    onChange={(e) => setRatingData({ ...ratingData, comment: e.target.value })}
                                    placeholder="Share your feedback..."
                                />
                            </div>

                            <div className="modal-actions">
                                <button className="btn btn-secondary" onClick={() => setShowRatingModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleSubmitReview}>Submit Review</button>
                            </div>
                        </div>
                    </div>
                )}

            </main>

            {/* Complaint Modal */}
            <ComplaintModal
                isOpen={showComplaintModal}
                onClose={() => setShowComplaintModal(false)}
                type="general"
            />

            {/* Chat Box Overlay */}
            <ChatWidget currentUser={user} />
        </div>
    );
};


export default EmployerDashboard;
