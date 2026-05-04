import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../index.css';
import StarRating from '../components/StarRating';
import JobMap from '../components/JobMap';
import NotificationBell from '../components/NotificationBell';
import ComplaintModal from '../components/ComplaintModal';
import ChatWidget from '../components/ChatWidget';
import { BASE_URL } from '../utils/api';

const EmployerDashboard = ({ user, logout }) => {
    const [hireModal, setHireModal] = useState({ show: false, workerId: null, teId: null, workerName: '', message: "I'm interested in hiring you for your travel period." });

    const handleHireWorker = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/time-exchange/hire`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    worker_id: hireModal.workerId, 
                    time_exchange_id: hireModal.teId,
                    message: hireModal.message 
                })
            });
            const result = await response.json();
            if (result.success) {
                toast.success(`Hire request sent to ${hireModal.workerName}!`, {
                    icon: '🚀',
                    style: { borderRadius: '15px', background: '#1e293b', color: '#fff' }
                });
                setHireModal({ ...hireModal, show: false });
            } else {
                toast.error(result.error || 'Failed to send hire request');
            }
        } catch (error) {
            console.error('Error hiring worker:', error);
            toast.error('Network error');
        }
    };

    const [activeView, _setActiveView] = useState(() => {
        const lastUser = sessionStorage.getItem('employer_lastUser');
        if (lastUser !== user?.id) { sessionStorage.setItem('employer_activeView', 'welcome'); sessionStorage.setItem('employer_lastUser', user?.id); return 'welcome'; }
        return sessionStorage.getItem('employer_activeView') || 'welcome';
    });
    const fetchTravelers = async () => {
        setLoadingTE(true);
        try {
            const url = teSearchCity 
                ? `${BASE_URL}/api/time-exchange?to_city=` + teSearchCity
                : `${BASE_URL}/api/time-exchange`;
            const res = await fetch(url);
            const result = await res.json();
            if (result.success) {
                const filtered = result.data.filter(t => t.available_for_work);
                setTeTravelers(filtered);
                sessionStorage.setItem('te_travelers', JSON.stringify(filtered));
                sessionStorage.setItem('te_search_city', teSearchCity);
            }
        } catch (err) { console.error('Error fetching travelers:', err); }
        finally { setLoadingTE(false); }
    };

    const setActiveView = (v) => { sessionStorage.setItem('employer_activeView', v); _setActiveView(v); window.history.pushState({ view: v }, ''); if (v === 'time-exchange') fetchTravelers(); };

    useEffect(() => {
        const onBack = (e) => {
            const prev = e.state?.view;
            if (prev) { sessionStorage.setItem('employer_activeView', prev); _setActiveView(prev); }
            else { sessionStorage.setItem('employer_activeView', 'welcome'); _setActiveView('welcome'); }
        };
        window.history.replaceState({ view: activeView }, '');
        window.addEventListener('popstate', onBack);
        return () => window.removeEventListener('popstate', onBack);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    const [hiringMode, setHiringMode] = useState('white'); // 'white' or 'blue'
    const [showPostJob, setShowPostJob] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [profileName, setProfileName] = useState('');
    const [profileAvatar, setProfileAvatar] = useState('');

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
    const [teTravelers, setTeTravelers] = useState(() => { try { const saved = sessionStorage.getItem('te_travelers'); return saved ? JSON.parse(saved) : []; } catch { return []; } });
    const [teSearchCity, setTeSearchCity] = useState(() => sessionStorage.getItem('te_search_city') || '');
    const [teWorkerType, setTeWorkerType] = useState(() => sessionStorage.getItem('te_worker_type') || 'all');
    const [loadingTE, setLoadingTE] = useState(false);

    // --- Booking State ---
    const [bookWorkers, setBookWorkers] = useState([]);
    const [bookSearch, setBookSearch] = useState('');
    const [loadingBookWorkers, setLoadingBookWorkers] = useState(false);
    const [myBookings, setMyBookings] = useState([]);
    const [loadingMyBookings, setLoadingMyBookings] = useState(false);
    const [bookingModal, setBookingModal] = useState({ show: false, worker: null });
    const [bookingForm, setBookingForm] = useState({ title: '', description: '', location: '', booking_date: '', start_time: '09:00', end_time: '17:00', offered_rate: '' });
    const [submittingBooking, setSubmittingBooking] = useState(false);
    const [bookViewTab, setBookViewTab] = useState('browse');

    const fetchBookWorkers = async (searchVal) => {
        setLoadingBookWorkers(true);
        try {
            const token = sessionStorage.getItem('token');
            const q = searchVal !== undefined ? searchVal : bookSearch;
            const url = q.trim() ? `${BASE_URL}/api/bookings/workers?search=${encodeURIComponent(q)}` : `${BASE_URL}/api/bookings/workers`;
            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            const result = await res.json();
            if (result.success) setBookWorkers(result.data);
        } catch (err) { console.error('Error fetching workers:', err); }
        finally { setLoadingBookWorkers(false); }
    };

    const fetchMyBookings = async () => {
        setLoadingMyBookings(true);
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/api/bookings/employer`, { headers: { 'Authorization': `Bearer ${token}` } });
            const result = await res.json();
            if (result.success) setMyBookings(result.data);
        } catch (err) { console.error('Error fetching bookings:', err); }
        finally { setLoadingMyBookings(false); }
    };

    const handleCreateBooking = async (e) => {
        e.preventDefault();
        
        // Validation: Check if time is within worker's schedule (if schedule is in HH:mm-HH:mm format)
        const worker = bookingModal.worker;
        if (worker?.availability && worker.availability.includes('-')) {
            const parts = worker.availability.split('-');
            if (parts.length === 2) {
                const wStart = parts[0].trim();
                const wEnd = parts[1].trim();
                const timeRegex = /^\d{2}:\d{2}$/;
                
                if (timeRegex.test(wStart) && timeRegex.test(wEnd)) {
                    if (bookingForm.start_time < wStart || bookingForm.end_time > wEnd) {
                        toast.error(`Worker is only available between ${wStart} and ${wEnd}`);
                        return;
                    }
                }
            }
        }

        setSubmittingBooking(true);
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...bookingForm, worker_id: bookingModal.worker?.id })
            });
            const result = await res.json();
            if (result.success) {
                toast.success('Booking request sent!', { icon: '📅' });
                
                if (bookingModal.linkedAppId) {
                    await handleStatusUpdate(bookingModal.linkedAppId, 'Offered');
                }

                setBookingModal({ show: false, worker: null });
                setBookingForm({ title: '', description: '', location: '', booking_date: '', start_time: '09:00', end_time: '17:00', offered_rate: '' });
                fetchMyBookings();
                setBookViewTab('my-bookings');
            } else {
                toast.error(result.error || 'Failed to create booking');
            }
        } catch (err) { toast.error('Network error'); }
        finally { setSubmittingBooking(false); }
    };

    const handleBookingStatus = async (bookingId, status) => {
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/api/bookings/${bookingId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            const result = await res.json();
            if (result.success) {
                toast.success(`Booking ${status.toLowerCase()}`);
                setMyBookings(myBookings.map(b => b.id === bookingId ? { ...b, status } : b));
            }
        } catch (err) { toast.error('Error updating status'); }
    };

    // International Jobs State
    const [intlJob, setIntlJob] = useState({
        title: '', description: '', country: '', city: '',
        salary: '', currency: 'USD', visa_sponsored: false,
        type: 'white', requirements: '', benefits: ''
    });
    const [submittingIntl, setSubmittingIntl] = useState(false);

    // Employer's International Jobs List + Applicant Management
    const [myIntlJobs, setMyIntlJobs] = useState([]);
    const [loadingMyIntlJobs, setLoadingMyIntlJobs] = useState(false);
    const [selectedIntlJob, setSelectedIntlJob] = useState(null);
    const [intlApplicants, setIntlApplicants] = useState([]);
    const [loadingIntlApps, setLoadingIntlApps] = useState(false);



    // Delete an international job
    const handleDeleteIntlJob = async (jobId) => {
        toast((t) => (
            <div>
                <p style={{ fontWeight: 600 }}>Delete this international job?</p>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>This will also remove all applications.</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button className="btn btn-primary" style={{ background: '#ef4444', padding: '6px 16px', fontSize: '0.85rem' }}
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                const response = await fetch(`${BASE_URL}/api/international-jobs/${jobId}`, { method: 'DELETE' });
                                const result = await response.json();
                                if (result.success) {
                                    setMyIntlJobs(myIntlJobs.filter(j => j.id !== jobId));
                                    toast.success('Job deleted successfully');
                                } else {
                                    toast.error(result.error || 'Failed to delete');
                                }
                            } catch (error) {
                                toast.error('Network error');
                            }
                        }}
                    >Delete</button>
                    <button className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '0.85rem' }} onClick={() => toast.dismiss(t.id)}>Cancel</button>
                </div>
            </div>
        ), { duration: Infinity, id: `delete-intl-${jobId}` });
    };

    // Fetch employer's own international jobs
    const fetchMyIntlJobs = async () => {
        setLoadingMyIntlJobs(true);
        try {
            const response = await fetch(`${BASE_URL}/api/international-jobs/employer/${user.id}`);
            const result = await response.json();
            if (result.success) setMyIntlJobs(result.data);
        } catch (error) {
            console.error('Error fetching my international jobs:', error);
        } finally {
            setLoadingMyIntlJobs(false);
        }
    };

    // Auto-fetch when page reloads on this view
    useEffect(() => {
        if (activeView === 'my-international-jobs') fetchMyIntlJobs();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Open applicants modal for an international job
    const handleManageIntlJob = async (job) => {
        setSelectedIntlJob(job);
        setLoadingIntlApps(true);
        try {
            const response = await fetch(`${BASE_URL}/api/international-jobs/${job.id}/applications`);
            const result = await response.json();
            if (result.success) setIntlApplicants(result.data);
        } catch (error) {
            console.error('Error fetching intl applicants:', error);
        } finally {
            setLoadingIntlApps(false);
        }
    };

    // Update status of an international job application
    const handleIntlStatusUpdate = async (appId, newStatus) => {
        try {
            const response = await fetch(`${BASE_URL}/api/international-jobs/applications/${appId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const result = await response.json();
            if (result.success) {
                setIntlApplicants(intlApplicants.map(app =>
                    app.id === appId ? { ...app, status: newStatus } : app
                ));
                toast.success(`Application ${newStatus}`);
            }
        } catch (error) {
            console.error('Error updating intl application:', error);
            toast.error('Failed to update status');
        }
    };

    const handlePostIntlJob = async (e) => {
        e.preventDefault();
        setSubmittingIntl(true);
        try {
            const response = await fetch(`${BASE_URL}/api/international-jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...intlJob, employer_id: user.id })
            });
            const result = await response.json();
            if (result.success) {
                toast.success('International job posted successfully!');
                setIntlJob({ title: '', description: '', country: '', city: '', salary: '', currency: 'USD', visa_sponsored: false, type: 'white', requirements: '', benefits: '' });
                setActiveView('welcome');
            } else {
                toast.error(result.error || 'Failed to post job');
            }
        } catch (error) {
            console.error('Error posting international job:', error);
            toast.error('Network error. Please try again.');
        } finally {
            setSubmittingIntl(false);
        }
    };

    const COUNTRIES = ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Canada', 'United Kingdom', 'Germany', 'Australia', 'Malaysia', 'Turkey', 'China', 'Japan', 'South Korea', 'United States', 'Other'];
    const CURRENCIES = ['USD', 'AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'CAD', 'GBP', 'EUR', 'AUD', 'MYR', 'TRY', 'CNY', 'JPY', 'KRW', 'PKR'];

    // Fetch Jobs from API
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const response = await fetch(`${BASE_URL}/api/jobs/my-jobs`, {
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
                const res = await fetch(`${BASE_URL}/api/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.full_name) {
                        setProfileName(data.full_name);
                    }
                    if (data.avatar_url) {
                        setProfileAvatar(data.avatar_url);
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

            const response = await fetch(`${BASE_URL}/api/jobs`, {
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

    const executeDeleteJob = async (jobId) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/jobs/${jobId}`, {
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

    const handleDeleteJob = (jobId) => {
        toast((t) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontWeight: '500' }}>Are you sure you want to delete this job?</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        className="btn btn-danger btn-sm" 
                        style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}
                        onClick={() => {
                            toast.dismiss(t.id);
                            executeDeleteJob(jobId);
                        }}
                    >
                        Delete
                    </button>
                    <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), { duration: Infinity, id: `delete-toast-${jobId}` });
    };

    const [applicants, setApplicants] = useState([]);
    const [loadingApps, setLoadingApps] = useState(false);
    const [chatError, setChatError] = useState(null);

    const navigate = useNavigate();

    const handleStartChat = async (jobId, candidateId) => {
        setChatError(null);
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/api/chat/start`, {
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
            const response = await fetch(`${BASE_URL}/api/jobs/${job.id}/applications`, {
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
            const response = await fetch(`${BASE_URL}/api/jobs/applications/${appId}/status`, {
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
            const response = await fetch(`${BASE_URL}/api/reviews`, {
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
                <div 
                    className="wc-nav-brand" 
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#4f46e5' }}
                    onClick={() => setActiveView('welcome')}
                    title="Back to Dashboard"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    JobNova Recruiter
                </div>
                <div className="wc-user-menu" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '5px', marginRight: '5px' }}>
                        <Link to="/about" className="wc-nav-link" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>About Us</Link>
                        <Link to="/contact" className="wc-nav-link" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>Contact Us</Link>
                    </div>
                    <NotificationBell language="en" />
                    <span className="wc-user-greeting" style={{ marginRight: '5px' }}>{getDisplayName()}</span>
                    <div 
                        onClick={() => navigate('/profile')}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#4f46e5',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        title="My Profile"
                    >
                        {profileAvatar ? (
                            <img src={profileAvatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            getDisplayName() ? getDisplayName().charAt(0).toUpperCase() : 'U'
                        )}
                    </div>
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

                {/* -------------------- WELCOME VIEW -------------------- */}
                {activeView === 'welcome' && (
                    <section className="wc-welcome-section">
                        <div className="wc-welcome-hero">
                            <h1>Welcome back, {getDisplayName()}! 👋</h1>
                            <p>What would you like to do today?</p>
                        </div>
                        <div className="wc-dashboard-grid">
                            <div className="wc-dash-card" onClick={() => setActiveView('dashboard')}>
                                <div className="wc-dash-card-icon">📝</div>
                                <h3>Post a Job</h3>
                                <p>Create new job listings for workers</p>
                            </div>
                            <div className="wc-dash-card" onClick={() => setActiveView('dashboard')}>
                                <div className="wc-dash-card-icon">📂</div>
                                <h3>Manage Applications</h3>
                                <p>Review candidates and manage hiring</p>
                            </div>
                            <div className="wc-dash-card" onClick={() => setActiveView('dashboard')}>
                                <div className="wc-dash-card-icon">📋</div>
                                <h3>My Job Postings</h3>
                                <p>View and manage your active listings</p>
                            </div>
                            <div className="wc-dash-card" onClick={() => { fetchBookWorkers(''); fetchMyBookings(); setActiveView('book-workers'); }}>
                                <div className="wc-dash-card-icon">📅</div>
                                <h3>Book Workers</h3>
                                <p>Schedule and book blue-collar workers</p>
                            </div>
                            <div className="wc-dash-card" onClick={() => setActiveView('time-exchange')}>
                                <div className="wc-dash-card-icon">✈️</div>
                                <h3>Time Exchange Explorer</h3>
                                <p>Explore skilled workers traveling to your city</p>
                            </div>

                            <div className="wc-dash-card" onClick={() => { fetchMyIntlJobs(); setActiveView('my-international-jobs'); }}>
                                <div className="wc-dash-card-icon">📋</div>
                                <h3>My International Jobs</h3>
                                <p>View applicants for your overseas listings</p>
                            </div>
<div className="wc-dash-card" onClick={() => setActiveView('post-international')}>
                                <div className="wc-dash-card-icon">🌍</div>
                                <h3>Post International Job</h3>
                                <p>Create overseas job opportunities</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* -------------------- TIME EXCHANGE EXPLORER VIEW -------------------- */}
                {activeView === 'time-exchange' && (
                    <section style={{ padding: '0' }}>
                        {/* Premium Hero Banner */}
                        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #312e81 50%, #0f172a 100%)', padding: '3.5rem 2rem', borderRadius: '24px', marginBottom: '2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden', border: '1px solid rgba(99, 102, 241, 0.2)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)' }}>
                            <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)', filter: 'blur(40px)' }}></div>
                            <h1 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0', color: '#ffffff', fontWeight: 800, position: 'relative', zIndex: 1, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                                Time Exchange Explorer
                            </h1>
                            <p style={{ color: '#ffffff', margin: '0', fontSize: '1.1rem', position: 'relative', zIndex: 1 }}>
                                Discover skilled workers traveling to your city for short-term tasks
                            </p>
                        </div>

                        <div className="te-explorer-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', display: 'flex', gap: '1rem', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                <input 
                                    type="text" 
                                    placeholder="Search by city (e.g. Lahore)..." 
                                    value={teSearchCity}
                                    onChange={e => setTeSearchCity(e.target.value)}
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                                <select 
                                    value={teWorkerType}
                                    onChange={e => { setTeWorkerType(e.target.value); sessionStorage.setItem('te_worker_type', e.target.value); }}
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', outline: 'none' }}
                                >
                                    <option value="all">All Worker Types</option>
                                    <option value="blue_collar">Blue-Collar (Skilled Worker)</option>
                                    <option value="white_collar">White-Collar (Professional)</option>
                                </select>
                                <button onClick={fetchTravelers} className="btn btn-primary" style={{ padding: '0 2rem' }}>Search</button>
                            </div>

                            {loadingTE ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Searching for travelers...</div>
                            ) : teTravelers.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '16px', color: '#64748b' }}>
                                    No travelers found for this city. Try a different search.
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                    {teTravelers.filter(trav => teWorkerType === 'all' || trav.user?.role === teWorkerType).map(trav => (
                                        <div key={trav.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                            <div style={{ display: 'flex', gap: '15px', marginBottom: '1rem' }}>
                                                <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
                                                    {trav.user?.profile_picture ? <img src={trav.user.profile_picture} alt="Profile" style={{width:'100%', height:'100%', borderRadius:'15px', objectFit:'cover'}} /> : trav.user?.full_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{trav.user?.full_name}</h3>
                                                    <span style={{ fontSize: '0.8rem', background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '10px', display: 'inline-block', marginTop: '4px' }}>
                                                        {trav.user?.role === 'blue_collar' ? 'Skilled Worker' : 'Professional'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                                <div style={{ color: '#64748b' }}>From: <span style={{ color: '#1e293b', fontWeight: 600 }}>{trav.from_city}</span></div>
                                                <div style={{ color: '#64748b' }}>To: <span style={{ color: '#1e293b', fontWeight: 600 }}>{trav.to_city}</span></div>
                                                <div style={{ color: '#64748b', gridColumn: 'span 2' }}>
                                                    Dates: <span style={{ color: '#1e293b', fontWeight: 600 }}>{new Date(trav.travel_date_start).toLocaleDateString()} - {new Date(trav.travel_date_end).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            {trav.skills && (
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                    <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#64748b' }}>Skills:</p>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                                        {(Array.isArray(trav.skills) ? trav.skills : String(trav.skills).split(',')).map(s => (
                                                            <span key={s} style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px' }}>{typeof s === 'string' ? s.trim() : s}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <button onClick={() => navigate('/profile/' + trav.user_id)} className="btn btn-primary" style={{ width: '100%', borderRadius: '10px', padding: '10px', background: '#4f46e5' }}>
                                                    👤 View Profile
                                                </button>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => {
                                                        const token = sessionStorage.getItem('token');
                                                        fetch(`${BASE_URL}/api/chat/start`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ job_id: null, candidate_id: trav.user_id }) })
                                                        .then(r => r.json()).then(data => { if (data.session) { window.dispatchEvent(new CustomEvent('open-chat', { detail: { session: data.session } })); } })
                                                    }} className="btn" style={{ flex: 1, borderRadius: '10px', padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', fontWeight: 600 }}>
                                                        💬 Message
                                                    </button>
                                                    <button onClick={() => setHireModal({ show: true, workerId: trav.user_id, teId: trav.id, workerName: trav.user?.first_name || 'Worker', message: "I'm interested in hiring you for your travel period." })} className="btn" style={{ flex: 1, borderRadius: '10px', padding: '10px', background: '#10b981', color: '#fff', border: 'none', fontWeight: 600 }}>
                                                        💼 Send Request
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* -------------------- POST INTERNATIONAL JOB VIEW -------------------- */}
                {activeView === 'post-international' && (
                    <section style={{ padding: '0' }}>
                        {/* Premium Hero Banner */}
                        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #312e81 50%, #0f172a 100%)', padding: '3.5rem 2rem', borderRadius: '24px', marginBottom: '2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden', border: '1px solid rgba(99, 102, 241, 0.2)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)' }}>
                            <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)', filter: 'blur(40px)' }}></div>
                            <h1 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0', color: '#ffffff', fontWeight: 800, position: 'relative', zIndex: 1, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                                Post International Job
                            </h1>
                            <p style={{ color: '#ffffff', margin: '0', fontSize: '1.1rem', position: 'relative', zIndex: 1 }}>
                                Create an overseas opportunity and discover global talent
                            </p>
                        </div>

                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #4f46e5, #8b5cf6)' }} />
                                
                                <form onSubmit={handlePostIntlJob}>
                                    <h3 style={{ color: '#0f172a', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', fontWeight: 700 }}>Job Details</h3>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                        <div>
                                            <label style={{ color: '#475569', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}><span>📝</span> Job Title *</label>
                                            <input type="text" value={intlJob.title} onChange={e => setIntlJob({...intlJob, title: e.target.value})} required placeholder="e.g., Senior Developer" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontSize: '0.95rem', outline: 'none', transition: 'all 0.3s' }} onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.background = '#ffffff'; }} onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc'; }} />
                                        </div>
                                        <div>
                                            <label style={{ color: '#475569', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}><span>💼</span> Job Type *</label>
                                            <select value={intlJob.type} onChange={e => setIntlJob({...intlJob, type: e.target.value})} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontSize: '0.95rem', outline: 'none', transition: 'all 0.3s', cursor: 'pointer' }} onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#cbd5e1'}>
                                                <option value="white">White-Collar (Professional)</option>
                                                <option value="blue">Blue-Collar (Skilled Labor)</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <h3 style={{ color: '#0f172a', marginTop: '2rem', marginBottom: '1.5rem', fontSize: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', fontWeight: 700 }}>Location & Compensation</h3>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                        <div>
                                            <label style={{ color: '#475569', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}><span>🌍</span> Country *</label>
                                            <select value={intlJob.country} onChange={e => setIntlJob({...intlJob, country: e.target.value})} required style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontSize: '0.95rem', outline: 'none', transition: 'all 0.3s', cursor: 'pointer' }} onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#cbd5e1'}>
                                                <option value="">Select Country</option>
                                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ color: '#475569', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}><span>🏙️</span> City</label>
                                            <input type="text" value={intlJob.city} onChange={e => setIntlJob({...intlJob, city: e.target.value})} placeholder="e.g., Dubai" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontSize: '0.95rem', outline: 'none', transition: 'all 0.3s' }} onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.background = '#ffffff'; }} onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc'; }} />
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                        <div>
                                            <label style={{ color: '#475569', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}><span>💰</span> Salary</label>
                                            <input type="text" value={intlJob.salary} onChange={e => setIntlJob({...intlJob, salary: e.target.value})} placeholder="e.g., 5000/month" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontSize: '0.95rem', outline: 'none', transition: 'all 0.3s' }} onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.background = '#ffffff'; }} onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc'; }} />
                                        </div>
                                        <div>
                                            <label style={{ color: '#475569', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}><span>💵</span> Currency</label>
                                            <select value={intlJob.currency} onChange={e => setIntlJob({...intlJob, currency: e.target.value})} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontSize: '0.95rem', outline: 'none', transition: 'all 0.3s', cursor: 'pointer' }} onFocus={e => e.target.style.borderColor = '#059669'} onBlur={e => e.target.style.borderColor = '#cbd5e1'}>
                                                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <h3 style={{ color: '#0f172a', marginTop: '2rem', marginBottom: '1.5rem', fontSize: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', fontWeight: 700 }}>Role Description & Requirements</h3>
                                    
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ color: '#475569', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}><span>📄</span> Description</label>
                                        <textarea value={intlJob.description} onChange={e => setIntlJob({...intlJob, description: e.target.value})} placeholder="Describe the role, responsibilities..." rows={4} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontSize: '0.95rem', outline: 'none', transition: 'all 0.3s', resize: 'vertical' }} onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.background = '#ffffff'; }} onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc'; }} />
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ color: '#475569', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}><span>✅</span> Requirements</label>
                                        <textarea value={intlJob.requirements} onChange={e => setIntlJob({...intlJob, requirements: e.target.value})} placeholder="e.g., 3+ years experience, valid passport..." rows={3} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontSize: '0.95rem', outline: 'none', transition: 'all 0.3s', resize: 'vertical' }} onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.background = '#ffffff'; }} onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc'; }} />
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ color: '#475569', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}><span>🎁</span> Benefits</label>
                                        <textarea value={intlJob.benefits} onChange={e => setIntlJob({...intlJob, benefits: e.target.value})} placeholder="e.g., Free accommodation, annual flights..." rows={3} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontSize: '0.95rem', outline: 'none', transition: 'all 0.3s', resize: 'vertical' }} onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.background = '#ffffff'; }} onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc'; }} />
                                    </div>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', padding: '1.25rem', borderRadius: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                                        <div>
                                            <span style={{ color: '#059669', fontWeight: 600, fontSize: '1.05rem', display: 'block', marginBottom: '4px' }}>✈️ Visa Sponsored</span>
                                            <span style={{ color: '#475569', fontSize: '0.85rem' }}>Are you providing visa assistance for this role?</span>
                                        </div>
                                        <label className="switch" style={{ marginBottom: 0, transform: 'scale(1.1)' }}>
                                            <input type="checkbox" checked={intlJob.visa_sponsored} onChange={e => setIntlJob({...intlJob, visa_sponsored: e.target.checked})} />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button type="submit" disabled={submittingIntl} className="btn btn-primary" style={{ flex: 2, padding: '1rem', fontSize: '1.05rem', fontWeight: 600, borderRadius: '14px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', boxShadow: '0 4px 15px rgba(79,70,229,0.3)', transition: 'all 0.3s', color: 'white' }} onMouseOver={e => { if(!e.currentTarget.disabled) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.4)'; } }} onMouseOut={e => { if(!e.currentTarget.disabled) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(79,70,229,0.3)'; } }}>
                                            {submittingIntl ? '⏳ Posting...' : 'Publish International Job'}
                                        </button>
                                        <button type="button" onClick={() => setActiveView('my-international-jobs')} className="btn btn-secondary" style={{ flex: 1, padding: '1rem', fontSize: '1.05rem', fontWeight: 500, borderRadius: '14px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', transition: 'all 0.3s' }} onMouseOver={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }} onMouseOut={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}>
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </section>
                )}


                {/* -------------------- MY INTERNATIONAL JOBS VIEW -------------------- */}
                {activeView === 'my-international-jobs' && (
                    <section className="wc-welcome-section">
                        <div style={{ 
                            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
                            padding: '3rem 2rem',
                            borderRadius: '24px',
                            marginBottom: '2rem',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                        }}>
                            <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)', filter: 'blur(50px)' }}></div>
                            <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }}></div>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem', color: '#ffffff', fontWeight: 800 }}>
                                    My International Postings
                                </h1>
                                <p style={{ color: '#cbd5e1', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
                                    Manage your global listings, track international talent, and handle visa sponsorships seamlessly.
                                </p>
                            </div>
                        </div>
                        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={() => setActiveView('post-international')} 
                                    style={{ 
                                        padding: '1rem 2rem', 
                                        fontSize: '1.1rem', 
                                        fontWeight: 600, 
                                        borderRadius: '16px',
                                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                        border: 'none',
                                        boxShadow: '0 10px 20px rgba(79,70,229,0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(79,70,229,0.4)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(79,70,229,0.3)'; }}
                                >
                                    <span style={{ fontSize: '1.2rem', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</span>
                                    Post New International Job
                                </button>
                            </div>

                            {loadingMyIntlJobs ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading your international jobs...</div>
                            ) : myIntlJobs.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                                    <p style={{ color: '#64748b' }}>You haven't posted any international jobs yet.</p>
                                    <button className="btn btn-primary" onClick={() => setActiveView('post-international')} style={{ marginTop: '1rem' }}>Post Your First International Job</button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {myIntlJobs.map(job => (
                                        <div key={job.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderLeft: '4px solid ' + (job.type === 'blue' ? '#3b82f6' : '#8b5cf6'), transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                    <h3 style={{ color: '#0f172a', margin: 0, fontSize: '1.15rem', textTransform: 'capitalize', fontWeight: 700 }}>{job.title}</h3>
                                                    <span style={{ background: job.status === 'Active' ? '#dcfce7' : '#fef3c7', color: job.status === 'Active' ? '#166534' : '#92400e', padding: '2px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600 }}>● {job.status}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', color: '#475569', fontSize: '0.8rem' }}>
                                                    <span style={{ background: '#f1f5f9', padding: '3px 10px', borderRadius: '8px' }}>📍 {job.city ? job.city + ', ' : ''}{job.country}</span>
                                                    <span style={{ background: '#ecfdf5', padding: '3px 10px', borderRadius: '8px', color: '#059669', fontWeight: 500 }}>💰 {job.currency} {job.salary}</span>
                                                    <span style={{ background: job.type === 'blue' ? '#eff6ff' : '#f3e8ff', padding: '3px 10px', borderRadius: '8px', color: job.type === 'blue' ? '#2563eb' : '#7e22ce' }}>{job.type === 'blue' ? '🔧 Blue-Collar' : '💼 White-Collar'}</span>
                                                    {job.visa_sponsored && <span style={{ background: '#ecfdf5', padding: '3px 10px', borderRadius: '8px', color: '#059669' }}>✈️ Visa</span>}
                                                </div>
                                                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0.5rem 0 0 0', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{job.description}</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => handleManageIntlJob(job)}
                                                    style={{ padding: '0.6rem 1.2rem', whiteSpace: 'nowrap' }}
                                                >
                                                    👥 View Applicants
                                                </button>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => handleDeleteIntlJob(job.id)}
                                                    style={{ padding: '0.6rem 1.2rem', whiteSpace: 'nowrap', background: '#fee2e2', color: '#dc2626', border: 'none' }}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* -------------------- INTERNATIONAL APPLICANTS MODAL -------------------- */}
                {selectedIntlJob && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '800px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>🌍 International Job Applicants</h2>
                                <button
                                    onClick={() => setSelectedIntlJob(null)}
                                    style={{ color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                                    aria-label="Close"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, color: '#1e293b' }}>{selectedIntlJob.title}</h3>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                                    📍 {selectedIntlJob.city ? selectedIntlJob.city + ', ' : ''}{selectedIntlJob.country} &nbsp;|&nbsp; 💰 {selectedIntlJob.currency} {selectedIntlJob.salary}
                                </p>
                            </div>

                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                                            <th style={{ padding: '12px', color: '#475569' }}>Candidate</th>
                                            <th style={{ padding: '12px', color: '#475569' }}>Experience</th>
                                            <th style={{ padding: '12px', color: '#475569' }}>Status</th>
                                            <th style={{ padding: '12px', color: '#475569' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingIntlApps ? (
                                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Loading applicants...</td></tr>
                                        ) : intlApplicants.length === 0 ? (
                                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No applicants yet for this listing.</td></tr>
                                        ) : (
                                            intlApplicants.map(app => (
                                                <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '12px' }}>
                                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{app.applicant_name}</div>
                                                        {app.applicant_profile?.avg_rating > 0 && (
                                                            <div style={{ color: '#f59e0b', fontSize: '0.85rem' }}>⭐ {Number(app.applicant_profile.avg_rating).toFixed(1)}</div>
                                                        )}
                                                        {app.applicant_profile?.phone && (
                                                            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>📞 {app.applicant_profile.phone}</div>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '12px', color: '#475569' }}>
                                                        {app.applicant_profile?.experience_years ? app.applicant_profile.experience_years + ' Years' : 'N/A'}
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        <span style={{
                                                            padding: '4px 12px',
                                                            borderRadius: '12px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 600,
                                                            background: app.status === 'accepted' ? '#dcfce7' : app.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                                                            color: app.status === 'accepted' ? '#15803d' : app.status === 'rejected' ? '#dc2626' : '#b45309'
                                                        }}>
                                                            {app.status === 'accepted' ? '✅ Accepted' : app.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                            <button
                                                                className="btn btn-secondary"
                                                                style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#e0f2fe', color: '#0369a1', border: 'none' }}
                                                                onClick={() => navigate(`/profile/${app.applicant_id}`)}
                                                            >
                                                                👤 View Profile
                                                            </button>
                                                            <button 
                                                                className="btn"
                                                                style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600 }}
                                                                onClick={() => {
                                                                    const token = sessionStorage.getItem('token');
                                                                    fetch(`${BASE_URL}/api/chat/start`, {
                                                                        method: 'POST',
                                                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                                        body: JSON.stringify({ job_id: null, candidate_id: app.applicant_id })
                                                                    }).then(r => r.json()).then(data => {
                                                                        if (data.session) {
                                                                            window.dispatchEvent(new CustomEvent('open-chat', { detail: { session: data.session } }));
                                                                        }
                                                                    });
                                                                }}
                                                            >
                                                                💬 Message
                                                            </button>
                                                            {app.status === 'pending' && (
                                                                <>
                                                                    <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleIntlStatusUpdate(app.id, 'accepted')}>Accept</button>
                                                                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#fee2e2', color: '#dc2626', border: 'none' }} onClick={() => handleIntlStatusUpdate(app.id, 'rejected')}>Reject</button>
                                                                </>
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
                    </div>
                )}

                {/* -------------------- MAIN DASHBOARD VIEW -------------------- */}
                {activeView === 'dashboard' && (
                <>
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
                                                        <button className="btn btn-secondary btn-sm" style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#e0f2fe', color: '#0369a1', border: 'none' }} onClick={() => navigate(`/profile/${app.applicant_id}`)}>👤 View Profile</button>
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
                                                                    onClick={() => {
                                                                        if (hiringMode === 'white') {
                                                                            handleStatusUpdate(app.id, 'Shortlisted');
                                                                        } else {
                                                                            setBookingForm(prev => ({ ...prev, title: selectedJob?.title || '' }));
                                                                            setBookingModal({
                                                                                show: true,
                                                                                worker: {
                                                                                    id: app.applicant_id,
                                                                                    full_name: app.applicant_name || 'Worker',
                                                                                    availability: app.applicant_profile?.availability || null
                                                                                },
                                                                                linkedAppId: app.id
                                                                            });
                                                                        }
                                                                    }}
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

            </>)}
            </main>

            {/* Complaint Modal */}
            <ComplaintModal
                isOpen={showComplaintModal}
                onClose={() => setShowComplaintModal(false)}
                type="general"
            />

            {/* Hire Request Modal */}
            {hireModal.show && (
                <div className="modal-overlay" style={{ zIndex: 2000 }}>
                    <div className="modal-content" style={{ maxWidth: '500px', borderRadius: '30px', padding: '2rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ background: '#ecfdf5', width: '70px', height: '70px', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 15px' }}>🚀</div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', marginBottom: '5px' }}>Hire {hireModal.workerName}</h2>
                            <p style={{ color: '#64748b' }}>Send a professional work invitation for their travel period.</p>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>Your Message</label>
                            <textarea 
                                className="form-input"
                                rows="4"
                                value={hireModal.message}
                                onChange={(e) => setHireModal({ ...hireModal, message: e.target.value })}
                                style={{ borderRadius: '15px', padding: '12px', border: '2px solid #f1f5f9', width: '100%', outline: 'none' }}
                                placeholder="Write a short message about the work..."
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button 
                                onClick={() => setHireModal({ ...hireModal, show: false })}
                                className="btn"
                                style={{ flex: 1, padding: '12px', borderRadius: '15px', background: '#f1f5f9', color: '#475569', border: 'none', fontWeight: 700 }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleHireWorker}
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '12px', borderRadius: '15px', background: '#10b981', color: '#fff', border: 'none', fontWeight: 700, boxShadow: '0 8px 16px rgba(16,185,129,0.2)' }}
                            >
                                Send Offer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* -------------------- BOOK WORKERS VIEW -------------------- */}
            {activeView === 'book-workers' && (
                <section style={{ padding: '0' }}>
                    {/* Premium Hero Banner */}
                    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #312e81 50%, #0f172a 100%)', padding: '3.5rem 2rem', borderRadius: '24px', marginBottom: '2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden', border: '1px solid rgba(99, 102, 241, 0.2)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)' }}>
                        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)', filter: 'blur(40px)' }}></div>
                        <h1 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0', color: '#ffffff', fontWeight: 800, position: 'relative', zIndex: 1, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                            Book Workers
                        </h1>
                        <p style={{ color: '#ffffff', margin: '0', fontSize: '1.1rem', position: 'relative', zIndex: 1 }}>
                            Find and schedule blue-collar workers for your tasks
                        </p>
                    </div>

                    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: '0', marginBottom: '2rem', background: '#f1f5f9', borderRadius: '14px', padding: '4px', maxWidth: '400px' }}>
                            <button onClick={() => { setBookViewTab('browse'); fetchBookWorkers(''); }} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer', background: bookViewTab === 'browse' ? '#fff' : 'transparent', color: bookViewTab === 'browse' ? '#1e293b' : '#64748b', boxShadow: bookViewTab === 'browse' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s' }}>Browse Workers</button>
                            <button onClick={() => { setBookViewTab('my-bookings'); fetchMyBookings(); }} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer', background: bookViewTab === 'my-bookings' ? '#fff' : 'transparent', color: bookViewTab === 'my-bookings' ? '#1e293b' : '#64748b', boxShadow: bookViewTab === 'my-bookings' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s' }}>My Bookings</button>
                        </div>

                        {/* Browse Workers Tab */}
                        {bookViewTab === 'browse' && (
                            <>
                                <div style={{ background: '#fff', padding: '1rem 1.5rem', borderRadius: '16px', display: 'flex', gap: '1rem', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                                    <input type="text" placeholder="Search by name, trade, skill, or city..." value={bookSearch} onChange={e => setBookSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchBookWorkers()} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none' }} />
                                    <button onClick={() => fetchBookWorkers()} className="btn btn-primary" style={{ padding: '0 2rem', borderRadius: '10px' }}>Search</button>
                                </div>

                                {loadingBookWorkers ? (
                                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Searching workers...</div>
                                ) : bookWorkers.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '16px', color: '#64748b' }}>No workers found. Try a different search.</div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                        {bookWorkers.map(w => (
                                            <div key={w.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                                <div style={{ display: 'flex', gap: '14px', marginBottom: '1rem' }}>
                                                    <div style={{ width: '55px', height: '55px', borderRadius: '14px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
                                                        {w.avatar_url ? <img src={w.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (w.full_name || w.first_name || 'W').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#1e293b', fontWeight: 700 }}>{w.full_name || `${w.first_name || ''} ${w.last_name || ''}`.trim() || 'Worker'}</h3>
                                                        {w.trade && <span style={{ fontSize: '0.8rem', background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '10px', display: 'inline-block', marginTop: '4px' }}>{w.trade}</span>}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '0.88rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '1rem' }}>
                                                    {w.location && <span>📍 {w.location}</span>}
                                                    {w.hourly_rate && <span>💰 {w.hourly_rate}/hr</span>}
                                                    {w.availability && <span>⏱️ {w.availability}</span>}
                                                    {w.avg_rating > 0 && <span>⭐ {Number(w.avg_rating).toFixed(1)} ({w.total_reviews} reviews)</span>}
                                                </div>
                                                {w.skills && (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '1rem' }}>
                                                        {w.skills.split(',').slice(0, 4).map((s, i) => <span key={i} style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px' }}>{s.trim()}</span>)}
                                                    </div>
                                                )}
                                                <button onClick={() => setBookingModal({ show: true, worker: w })} className="btn btn-primary" style={{ width: '100%', borderRadius: '12px', padding: '10px', background: '#10b981', border: 'none', fontWeight: 700 }}>📅 Book This Worker</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* My Bookings Tab */}
                        {bookViewTab === 'my-bookings' && (
                            <>
                                {loadingMyBookings ? (
                                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading bookings...</div>
                                ) : myBookings.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '16px', color: '#64748b' }}>
                                        <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</p>
                                        <p>No bookings yet. Browse workers and create your first booking!</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {myBookings.map(b => (
                                            <div key={b.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                                <div style={{ flex: 1, minWidth: '200px' }}>
                                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#1e293b' }}>{b.title}</h3>
                                                    <p style={{ margin: '0 0 6px 0', color: '#64748b', fontSize: '0.9rem' }}>Worker: <strong>{b.worker?.full_name || 'Worker'}</strong> {b.worker?.trade ? `(${b.worker.trade})` : ''}</p>
                                                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: '#64748b', flexWrap: 'wrap' }}>
                                                        <span>📅 {new Date(b.booking_date).toLocaleDateString()}</span>
                                                        <span>⏰ {b.start_time?.slice(0,5)} - {b.end_time?.slice(0,5)}</span>
                                                        {b.location && <span>📍 {b.location}</span>}
                                                        {b.offered_rate && <span>💰 {b.offered_rate}</span>}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ padding: '6px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem', background: b.status === 'Pending' ? '#fef3c7' : b.status === 'Accepted' ? '#d1fae5' : b.status === 'Completed' ? '#dbeafe' : b.status === 'Rejected' ? '#fee2e2' : '#f1f5f9', color: b.status === 'Pending' ? '#92400e' : b.status === 'Accepted' ? '#065f46' : b.status === 'Completed' ? '#1e40af' : b.status === 'Rejected' ? '#991b1b' : '#475569' }}>{b.status}</span>
                                                    {b.status === 'Accepted' && <button onClick={() => handleBookingStatus(b.id, 'Completed')} className="btn" style={{ padding: '6px 14px', borderRadius: '12px', background: '#3b82f6', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.8rem' }}>Mark Done</button>}
                                                    {b.status === 'Pending' && <button onClick={() => handleBookingStatus(b.id, 'Cancelled')} className="btn" style={{ padding: '6px 14px', borderRadius: '12px', background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 600, fontSize: '0.8rem' }}>Cancel</button>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </section>
            )}

            {/* Booking Modal */}
            {bookingModal.show && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setBookingModal({ show: false, worker: null })}>
                    <div style={{ background: '#fff', borderRadius: '24px', padding: '2rem', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', color: '#1e293b' }}>📅 Book Worker</h2>
                        <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', fontSize: '0.9rem' }}>Booking <strong>{bookingModal.worker?.full_name || bookingModal.worker?.first_name || 'Worker'}</strong> {bookingModal.worker?.availability ? `(Avail: ${bookingModal.worker.availability})` : ''}</p>

                        <form onSubmit={handleCreateBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#334155', display: 'block', marginBottom: '4px' }}>Task Title *</label>
                                <input type="text" required value={bookingForm.title} onChange={e => setBookingForm({...bookingForm, title: e.target.value})} placeholder="e.g., Fix kitchen plumbing" style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }} />
                            </div>
                            <div>
                                <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#334155', display: 'block', marginBottom: '4px' }}>Description</label>
                                <textarea value={bookingForm.description} onChange={e => setBookingForm({...bookingForm, description: e.target.value})} placeholder="Describe the work needed..." rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem', resize: 'vertical' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#334155', display: 'block', marginBottom: '4px' }}>Location</label>
                                    <input type="text" value={bookingForm.location} onChange={e => setBookingForm({...bookingForm, location: e.target.value})} placeholder="e.g., Gulberg, Lahore" style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }} />
                                </div>
                                <div>
                                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#334155', display: 'block', marginBottom: '4px' }}>Offered Rate</label>
                                    <input type="text" value={bookingForm.offered_rate} onChange={e => setBookingForm({...bookingForm, offered_rate: e.target.value})} placeholder="e.g., Rs. 2000" style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#334155', display: 'block', marginBottom: '4px' }}>Date *</label>
                                <input type="date" required value={bookingForm.booking_date} onChange={e => setBookingForm({...bookingForm, booking_date: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#334155', display: 'block', marginBottom: '4px' }}>Start Time *</label>
                                    <input type="time" required value={bookingForm.start_time} onChange={e => setBookingForm({...bookingForm, start_time: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }} />
                                </div>
                                <div>
                                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#334155', display: 'block', marginBottom: '4px' }}>End Time *</label>
                                    <input type="time" required value={bookingForm.end_time} onChange={e => setBookingForm({...bookingForm, end_time: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                                <button type="button" onClick={() => setBookingModal({ show: false, worker: null })} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#f1f5f9', color: '#475569', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={submittingBooking} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#10b981', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>{submittingBooking ? 'Sending...' : '📅 Confirm Booking'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Chat Box Overlay */}
            <ChatWidget currentUser={user} />
        </div>
    );
};


export default EmployerDashboard;
