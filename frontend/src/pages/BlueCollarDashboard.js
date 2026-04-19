import toast from 'react-hot-toast';
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';
import JobMap from '../components/JobMap';
import NotificationBell from '../components/NotificationBell';
import ComplaintModal from '../components/ComplaintModal';
import VoiceSearchOverlay from '../components/VoiceSearchOverlay';
import ChatWidget from '../components/ChatWidget';
import '../index.css';
import { parseVoiceCommand } from '../utils/voiceCommandParser';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const translations = {
    en: {
        toggle_lang: 'اردو',
        nav_find_jobs: 'New Jobs',
        nav_my_jobs: 'My Active Jobs',
        nav_my_ratings: 'My Ratings ⭐',
        nav_profile: 'Profile',
        nav_hello: 'Hello',
        nav_logout: 'Logout',
        hero_welcome: 'Welcome',
        hero_subtitle: 'Start your work',
        status_current: 'Current Status',
        status_available: 'Are you available?',
        work_days: 'Work Days:',
        work_hours: 'Work Hours:',
        time_start: 'Start Time',
        time_end: 'End Time',
        btn_save_schedule: 'Save Schedule',
        btn_saving: 'Saving...',
        jobs_header: 'New Jobs 🚀',
        search_placeholder: 'Search title/location',
        filter_all: 'Any Duration',
        filter_hours: 'Hours',
        filter_days: 'Days',
        filter_months: 'Months',
        loading_jobs: 'Loading jobs...',
        no_jobs_found: 'No jobs found matching your search.',
        try_changing: 'Try changing your search terms or filters.',
        btn_apply: 'Apply',
        alert_applied: 'Applied to job successfully!',
        alert_apply_fail: 'Failed to apply. You may have already applied.',
        alert_schedule_saved: 'Schedule saved successfully!',
        alert_schedule_fail: 'Failed to save schedule',
        my_jobs_header: 'My Active Jobs & Applications 📋',
        loading_apps: 'Loading applications...',
        no_apps_yet: "You haven't applied to any jobs yet.",
        btn_browse_jobs: 'Browse Jobs',
        status_label: 'Status:',
        btn_rate_employer: 'Rate Employer ⭐',
        my_ratings_header: 'Ratings You Received ⭐',
        loading_ratings: 'Loading ratings...',
        no_ratings_yet: 'No ratings yet.',
        complete_jobs_prompt: 'Complete jobs to get rated by employers.',
        feedback_from: 'Feedback from Employer',
        rate_employer_title: 'Rate Employer',
        rate_employer_subtitle: 'How was your experience working for',
        comment_optional: 'Comment (Optional)',
        comment_placeholder: 'Share your feedback...',
        btn_cancel: 'Cancel',
        btn_submit_review: 'Submit Review',
        alert_review_success: 'Review submitted successfully!',
        alert_review_fail: 'Failed to submit review',
        unknown_job: 'Unknown Job',
        to_word: 'to',
        day_Mon: 'Mon',
        day_Tue: 'Tue',
        day_Wed: 'Wed',
        day_Thu: 'Thu',
        day_Fri: 'Fri',
        day_Sat: 'Sat',
        day_Sun: 'Sun',
        view_map: 'Map View',
        view_list: 'List View',
        radius_filter: 'Radius:',
        btn_accept_offer: 'Accept Offer',
        btn_reject_offer: 'Reject Offer',
        alert_offer_accepted: 'Offer Accepted!',
        alert_offer_rejected: 'Offer Rejected',
        alert_offer_fail: 'Failed to update offer status',
        tooltip_mic: 'Search by Voice',
        listening: 'Listening...',
        voice_error: 'Speech recognition failed. Please try again.'
    },
    ur: {
        toggle_lang: 'English',
        nav_find_jobs: 'نئی نوکریاں',
        nav_my_jobs: 'میرے کام',
        nav_my_ratings: 'میری ریٹنگز ⭐',
        nav_profile: 'پروفائل',
        nav_hello: 'خوش آمدید',
        nav_logout: 'لاگ آؤٹ',
        hero_welcome: 'خوش آمدید',
        hero_subtitle: 'اپنا کام شروع کریں',
        status_current: 'موجودہ صورتحال',
        status_available: 'کیا آپ کام کے لیے تیار ہیں؟',
        work_days: 'کام کے دن (Work Days):',
        work_hours: 'کام کے اوقات:',
        time_start: 'شروع',
        time_end: 'ختم',
        btn_save_schedule: 'اوقات محفوظ کریں',
        btn_saving: 'محفوظ ہو رہا ہے...',
        jobs_header: 'نئی نوکریاں 🚀',
        search_placeholder: 'تلاش کریں...',
        filter_all: 'کوئی بھی دورانیہ',
        filter_hours: 'گھنٹے',
        filter_days: 'دن',
        filter_months: 'مہینے',
        loading_jobs: 'نوکریاں تلاش کی جا رہی ہیں...',
        no_jobs_found: 'تلاش کے مطابق کوئی نوکری نہیں ملی۔',
        try_changing: 'اپنی تلاش تبدیل کر کے دیکھیں۔',
        btn_apply: 'درخواست دیں (Apply)',
        alert_applied: 'درخواست جمع کرائی گئی!',
        alert_apply_fail: 'درخواست جمع نہیں ہو سکی۔ کیا آپ پہلے ہی درخواست دے چکے ہیں؟',
        alert_schedule_saved: 'اوقات محفوظ کر لیے گئے!',
        alert_schedule_fail: 'اوقات محفوظ کرنے میں مسٔلہ پیش آیا',
        my_jobs_header: 'میرے کام 📋',
        loading_apps: 'درخواستیں تلاش کی جا رہی ہیں...',
        no_apps_yet: "آپ نے ابھی تک کسی نوکری کے لیے درخواست نہیں دی۔",
        btn_browse_jobs: 'نوکریاں تلاش کریں',
        status_label: 'سٹیٹس:',
        btn_rate_employer: 'ریٹنگ دیں ⭐',
        my_ratings_header: 'آپ کی ریٹنگز ⭐',
        loading_ratings: 'ریٹنگز تلاش کی جا رہی ہیں...',
        no_ratings_yet: 'ابھی تک کوئی ریٹنگ نہیں۔',
        complete_jobs_prompt: 'آجر سے ریٹنگ حاصل کرنے کے لیے کام مکمل کریں۔',
        btn_accept_offer: 'کام قبول کریں',
        btn_reject_offer: 'کام مسترد کریں',
        alert_offer_accepted: 'آپ نے کام قبول کر لیا ہے!',
        alert_offer_rejected: 'آپ نے کام مسترد کر دیا ہے۔',
        alert_offer_fail: 'سٹیٹس اپ ڈیٹ کرنے میں مسٔلہ پیش آیا',
        feedback_from: 'آجر کی طرف سے فیڈبیک',
        rate_employer_title: 'آجر کو ریٹنگ دیں',
        rate_employer_subtitle: 'آپ کا کام کرنے کا تجربہ کیسا رہا؟',
        comment_optional: 'تبصرہ (اختیاری)',
        comment_placeholder: 'اپنا فیڈبیک دیں...',
        btn_cancel: 'منسوخ کریں',
        btn_submit_review: 'ریٹنگ جمع کرائیں',
        alert_review_success: 'ریٹنگ جمع ہو گئی!',
        alert_review_fail: 'ریٹنگ جمع کرنے میں مسٔلہ پیش آیا',
        unknown_job: 'نامعلوم کام',
        to_word: 'سے',
        day_Mon: 'پیر',
        day_Tue: 'منگل',
        day_Wed: 'بدھ',
        day_Thu: 'جمعرات',
        day_Fri: 'جمعہ',
        day_Sat: 'ہفتہ',
        day_Sun: 'اتوار',
        view_map: 'نقشہ',
        view_list: 'فہرست',
        radius_filter: 'فاصلہ (km):',
        tooltip_mic: 'آواز سے تلاش کریں',
        listening: 'سن رہا ہے...',
        voice_error: 'آواز کی شناخت ناکام ہو گئی۔ براہ کرم دوبارہ کوشش کریں۔'
    }
};

const BlueCollarDashboard = ({ user, logout }) => {
    // --- State: Language ---
    const [language, setLanguage] = useState(() => {
        // Try to get saved language from localStorage, default to 'ur'
        const savedLang = localStorage.getItem('jobnova_preferred_language');
        return savedLang ? savedLang : 'ur';
    });
    const t = (key) => translations[language][key] || key;

    // --- State: General ---
    const [activeTab, setActiveTab] = useState('find-jobs'); // 'find-jobs', 'my-jobs', 'my-ratings'
    const [profileName, setProfileName] = useState('');
    const navigate = useNavigate();

    // --- State: Find Jobs ---
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [isSearchingAI, setIsSearchingAI] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDuration, setFilterDuration] = useState('All');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
    const [radius, setRadius] = useState(10); // Default 10km
    const [userLocation, setUserLocation] = useState(null);

    // --- State: Voice Search ---
    const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);

    // --- State: My Jobs & Ratings ---
    const [myApps, setMyApps] = useState([]);
    const [myRatings, setMyRatings] = useState([]);
    const [loadingApps, setLoadingApps] = useState(false);
    const [loadingRatings, setLoadingRatings] = useState(false);

    // --- State: Availability ---
    const [availability, setAvailability] = useState(true);
    const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [savingAvailability, setSavingAvailability] = useState(false);

    // --- State: Modals ---
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingData, setRatingData] = useState({ rating: 5, comment: '', app: null });

    // --- State: Support Modal ---
    const [showComplaintModal, setShowComplaintModal] = useState(false);

    // Fetch Profile Date for Availability
    useEffect(() => {
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
                    if (data.availability_days) {
                        setSelectedDays(data.availability_days.split(',').map(d => d.trim()));
                    }
                    if (data.availability_hours) {
                        const [start, end] = data.availability_hours.split('-');
                        if (start && end) {
                            setStartTime(start);
                            setEndTime(end);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching profile', error);
            }
        };
        fetchProfile();
    }, []);

    // Get user's location
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
                    // Silently ignore location denial
                }
            );
        }
    }, []);

    // Fetch Jobs (Depends on Location & Radius)
    const fetchJobs = useCallback(async (overrideSearchTerm) => {
        const termToUse = typeof overrideSearchTerm === 'string' ? overrideSearchTerm : searchTerm;
        setLoadingJobs(true);
        setIsSearchingAI(!!termToUse); // Show AI processing state if there's a search term
        try {
            const token = sessionStorage.getItem('token');

            let url = 'http://localhost:5000/api/jobs/match?type=blue';
            if (userLocation) {
                url = `http://localhost:5000/api/jobs/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${radius}`;
            }

            if (termToUse && termToUse.trim() !== '') {
                url += url.includes('?') ? `&search=${encodeURIComponent(termToUse)}` : `?search=${encodeURIComponent(termToUse)}`;
            }

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const blueJobs = data.filter(j => j.type === 'blue');
                setJobs(blueJobs);
                setFilteredJobs(blueJobs);
            }
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoadingJobs(false);
            setIsSearchingAI(false);
        }
    }, [userLocation, radius, searchTerm]);

    // Initial Load
    useEffect(() => {
        fetchJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userLocation, radius]);

    // Fetch My Apps & Ratings
    useEffect(() => {
        const fetchMyApps = async () => {
            setLoadingApps(true);
            try {
                const token = sessionStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/jobs/applications/my-applications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    
                    // Filter out Rejected apps and apps tied to Deleted jobs (unless completed)
                    const filteredApps = data.filter(app => {
                        if (app.status === 'Rejected') return false;
                        if ((!app.jobs || app.jobs.status === 'Deleted') && app.status !== 'Completed') return false;
                        return true;
                    });
                    
                    setMyApps(filteredApps);
                }
            } catch (error) {
                console.error('Failed to fetch applications:', error);
            } finally {
                setLoadingApps(false);
            }
        };

        const fetchMyRatings = async () => {
            setLoadingRatings(true);
            try {
                const token = sessionStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/reviews/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setMyRatings(data);
                }
            } catch (error) {
                console.error('Failed to fetch ratings:', error);
            } finally {
                setLoadingRatings(false);
            }
        };

        fetchMyApps();
        fetchMyRatings();
    }, []);

    // Handle Local Filter (Duration only, backend handles Text Semantic Search)
    useEffect(() => {
        // Exclude jobs the user has already applied for
        const appliedJobIds = new Set(myApps.map(app => app.job_id));
        let result = jobs.filter(job => !appliedJobIds.has(job.id));

        if (filterDuration !== 'All') {
            result = result.filter(job =>
                job.duration && job.duration.toLowerCase().includes(filterDuration.toLowerCase())
            );
        }
        setFilteredJobs(result);
    }, [filterDuration, jobs, myApps]);

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
                toast.success(t('alert_applied'));
                // Refresh my apps
                const appsRes = await fetch('http://localhost:5000/api/jobs/applications/my-applications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (appsRes.ok) setMyApps(await appsRes.json());
            } else {
                toast.error(t('alert_apply_fail'));
            }
        } catch (error) {
            console.error('Error applying:', error);
        }
    };

    const toggleDay = (day) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const saveAvailability = async () => {
        setSavingAvailability(true);
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    availability_days: selectedDays.join(', '),
                    availability_hours: `${startTime}-${endTime}`
                })
            });
            if (response.ok) {
                toast.success(t('alert_schedule_saved'));
            } else {
                toast.error(t('alert_schedule_fail'));
            }
        } catch (error) {
            console.error('Error saving availability', error);
        } finally {
            setSavingAvailability(false);
        }
    };

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
                    reviewee_id: ratingData.app.jobs.employer_id, // Rating the Employer
                    rating: ratingData.rating,
                    comment: ratingData.comment
                })
            });

            if (response.ok) {
                toast.success(t('alert_review_success'));
                setShowRatingModal(false);
            } else {
                const err = await response.json();
                toast.error(err.error || t('alert_review_fail'));
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
        return user?.phone || 'Worker';
    };

    const handleOfferResponse = async (appId, newStatus) => {
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
                if (newStatus === 'In Progress') {
                    toast(t('alert_offer_accepted'));
                } else {
                    toast(t('alert_offer_rejected'));
                }
                
                // Update local state
                setMyApps(myApps.map(app =>
                    app.id === appId ? { ...app, status: newStatus } : app
                ));
            } else {
                toast.error(t('alert_offer_fail'));
            }
        } catch (error) {
            console.error('Error updating offer status:', error);
            toast.error(t('alert_offer_fail'));
        }
    };

    const handleLangToggle = () => {
        setLanguage((prev) => {
            const newLang = prev === 'ur' ? 'en' : 'ur';
            localStorage.setItem('jobnova_preferred_language', newLang);
            return newLang;
        });
    };

    // --- Voice Search Handlers (Module 10) ---
    const handleVoiceResult = useCallback((transcript) => {
        setShowVoiceOverlay(false);
        if (!transcript || !transcript.trim()) return;

        // Parse the voice command to extract structured filters
        const parsed = parseVoiceCommand(transcript);

        // Apply the search text
        setSearchTerm(parsed.searchText);
        
        // INSTANTLY FIRE OFF THE SEARCH
        fetchJobs(parsed.searchText);

        // Apply duration filter if detected
        if (parsed.durationFilter) {
            setFilterDuration(parsed.durationFilter);
        }

        // Ensure we're on the find-jobs tab to show results
        setActiveTab('find-jobs');
    }, [fetchJobs]);

    return (
        <div className="wc-dashboard-container" dir={language === 'ur' ? 'rtl' : 'ltr'}>
            {/* Top Navigation Bar */}
            <nav className="wc-navbar">
                <div className="wc-nav-brand">JobNova Worker</div>
                <div className="wc-nav-links" style={{ gap: '10px' }}>
                    <button
                        className={`btn ${activeTab === 'find-jobs' ? 'btn-primary' : 'btn-outline-light'}`}
                        style={{
                            backgroundColor: activeTab === 'find-jobs' ? '#4f46e5' : 'transparent',
                            color: activeTab === 'find-jobs' ? 'white' : '#1e293b',
                            border: activeTab === 'find-jobs' ? 'none' : '1px solid #cbd5e1',
                            marginRight: '5px'
                        }}
                        onClick={() => setActiveTab('find-jobs')}
                    >
                        {t('nav_find_jobs')}
                    </button>
                    <button
                        className={`btn ${activeTab === 'my-jobs' ? 'btn-primary' : 'btn-outline-light'}`}
                        style={{
                            backgroundColor: activeTab === 'my-jobs' ? '#4f46e5' : 'transparent',
                            color: activeTab === 'my-jobs' ? 'white' : '#1e293b',
                            border: activeTab === 'my-jobs' ? 'none' : '1px solid #cbd5e1',
                            marginRight: '5px'
                        }}
                        onClick={() => setActiveTab('my-jobs')}
                    >
                        {t('nav_my_jobs')}
                    </button>
                    <button
                        className={`btn ${activeTab === 'my-ratings' ? 'btn-primary' : 'btn-outline-light'}`}
                        style={{
                            backgroundColor: activeTab === 'my-ratings' ? '#4f46e5' : 'transparent',
                            color: activeTab === 'my-ratings' ? 'white' : '#1e293b',
                            border: activeTab === 'my-ratings' ? 'none' : '1px solid #cbd5e1',
                            marginRight: '10px'
                        }}
                        onClick={() => setActiveTab('my-ratings')}
                    >
                        {t('nav_my_ratings')}
                    </button>
                    <Link to="/profile" className="btn btn-text" style={{ textDecoration: 'none', color: '#4f46e5', fontWeight: '600' }}>
                        {t('nav_profile')}
                    </Link>
                </div>
                <div className="wc-user-menu" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>

                    <NotificationBell language={language} />
                    <span className="wc-user-greeting">{t('nav_hello')}, {getDisplayName()}!</span>
                    <button onClick={logout} className="btn btn-outline-light btn-sm">{t('nav_logout')}</button>
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
                {/* Status Hero Section */}
                <section className="bc-search-section" style={{ padding: '3rem 2rem', marginBottom: '2rem' }}>
                    <h1>{t('hero_welcome')}</h1>
                    <p className="subtitle" style={{ marginBottom: '1.5rem' }}>{t('hero_subtitle')}</p>

                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {/* Main Target: Availability Card */}
                        <div className="bc-glass-card" style={{ maxWidth: '450px', flex: 1, display: 'block', margin: '0 auto', textAlign: language === 'ur' ? 'right' : 'left' }}>
                            <div className="status-text" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div>
                                    <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#fff' }}>{t('status_current')}</span>
                                    <span className="status-urdu" style={{ display: 'block', color: 'rgba(255,255,255,0.8)' }}>{t('status_available')}</span>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" checked={availability} onChange={() => setAvailability(!availability)} />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            {/* Detailed Schedule Manager */}
                            <div className="availability-manager" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                                <p style={{ fontSize: '1rem', color: '#fff', fontWeight: 600, marginBottom: '0.8rem' }}>{t('work_days')}</p>
                                <div className="days-selector">
                                    {DAYS_OF_WEEK.map(day => (
                                        <button
                                            key={day}
                                            className={`day-btn ${selectedDays.includes(day) ? 'selected' : ''}`}
                                            onClick={() => toggleDay(day)}
                                        >
                                            {t(`day_${day}`)}
                                        </button>
                                    ))}
                                </div>

                                <p style={{ fontSize: '1rem', color: '#fff', fontWeight: 600, margin: '1.5rem 0 0.8rem 0' }}>{t('work_hours')}</p>
                                <div className="hours-selector" style={{ alignItems: 'flex-end' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{t('time_start')}</label>
                                        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                                    </div>
                                    <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, paddingBottom: '10px' }}>{t('to_word')}</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{t('time_end')}</label>
                                        <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%', marginTop: '1.5rem', background: '#ffffff', color: '#4f46e5', border: 'none', fontWeight: 700 }}
                                    onClick={saveAvailability}
                                    disabled={savingAvailability}
                                >
                                    {savingAvailability ? t('btn_saving') : t('btn_save_schedule')}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- Find Jobs Tab --- */}
                {activeTab === 'find-jobs' && (
                    <section className="wc-job-results">
                        <div className="wc-results-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <h2>{t('jobs_header')}</h2>

                            {/* Search and Filters */}
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '320px' }}>
                                    <input
                                        type="text"
                                        placeholder={language === 'ur' ? 'تلاش... مثلاً: gari theek karny wala' : 'e.g., car fix karny wala...'}
                                        className="form-input"
                                        style={{ 
                                            padding: '0.5rem 5.5rem 0.5rem 1rem', 
                                            width: '100%',
                                            transition: 'all 0.3s ease'
                                        }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') fetchJobs();
                                        }}
                                    />
                                    <div style={{ position: 'absolute', right: '5px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                                        <button
                                            onClick={fetchJobs}
                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#4f46e5', padding: '5px', display: 'flex' }}
                                            title="Search"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="11" cy="11" r="8"></circle>
                                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                            </svg>
                                        </button>
                                        <div style={{ height: '20px', width: '1px', background: '#cbd5e1' }}></div>
                                        <button
                                            onClick={() => setShowVoiceOverlay(true)}
                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#4f46e5', padding: '5px', display: 'flex' }}
                                            title={t('tooltip_mic')}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                                <line x1="12" y1="19" x2="12" y2="23"></line>
                                                <line x1="8" y1="23" x2="16" y2="23"></line>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <select
                                    className="form-input"
                                    style={{ padding: '0.5rem 1rem', width: 'auto' }}
                                    value={filterDuration}
                                    onChange={(e) => setFilterDuration(e.target.value)}
                                >
                                    <option value="All">{t('filter_all')}</option>
                                    <option value="Hours">{t('filter_hours')}</option>
                                    <option value="Days">{t('filter_days')}</option>
                                    <option value="Months">{t('filter_months')}</option>
                                </select>

                                {/* Radius Filter & Geolocation Prompt */}
                                {!userLocation ? (
                                    <button
                                        className="btn btn-outline-light"
                                        onClick={() => {
                                            if (navigator.geolocation) {
                                                navigator.geolocation.getCurrentPosition(
                                                    (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
                                                    () => toast('Please allow location access in your browser to use the radius filter.')
                                                );
                                            }
                                        }}
                                        style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '5px', borderColor: '#cbd5e1', backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: 600 }}
                                        title="Enable location to find jobs near you"
                                    >
                                        📍 Use My Location
                                    </button>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f8fafc', padding: '0.2rem 0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>📍 {t('radius_filter')}</span>
                                        <select
                                            className="form-input"
                                            style={{ padding: '0.3rem', width: 'auto', background: 'transparent', border: 'none', fontWeight: 600, color: '#0f172a' }}
                                            value={radius}
                                            onChange={(e) => setRadius(Number(e.target.value))}
                                        >
                                            <option value={5}>5 km</option>
                                            <option value={10}>10 km</option>
                                            <option value={20}>20 km</option>
                                            <option value={50}>50 km</option>
                                        </select>
                                    </div>
                                )}

                                {/* Map / List View Toggle */}
                                <button
                                    className="btn btn-outline-light"
                                    onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                                    style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '5px', borderColor: '#cbd5e1', backgroundColor: '#fff' }}
                                >
                                    {viewMode === 'list' ? `🗺️ ${t('view_map')}` : `📋 ${t('view_list')}`}
                                </button>
                            </div>
                        </div>

                        {isSearchingAI ? (
                            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#4f46e5', fontWeight: 600 }}>
                                <div className="spinner" style={{ margin: '0 auto 10px auto', width: '30px', height: '30px', border: '3px solid #e0e7ff', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                AI Translating & Searching... 🧠
                            </div>
                        ) : loadingJobs ? (
                            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>{t('loading_jobs')}</div>
                        ) : viewMode === 'map' ? (
                            <div style={{ marginTop: '1rem', marginBottom: '2rem' }}>
                                <JobMap
                                    jobs={filteredJobs}
                                    readOnly={true}
                                    center={userLocation ? [userLocation.lat, userLocation.lng] : [31.5204, 74.3587]}
                                    setUserLocation={setUserLocation}
                                    onJobClick={(job) => {
                                        // User asked to close map and show the AD when clicked
                                        setViewMode('list');
                                        // Scroll to the job list after a short delay to allow React to render the list
                                        setTimeout(() => {
                                            const jobCard = document.getElementById(`job-card-${job.id}`);
                                            if (jobCard) {
                                                jobCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                // Highlight the card briefly
                                                jobCard.style.boxShadow = '0 0 0 4px rgba(79, 70, 229, 0.4)';
                                                setTimeout(() => jobCard.style.boxShadow = '', 2000);
                                            }
                                        }, 100);
                                    }}
                                    onProfileClick={(profile) => profile?.user_id && navigate(`/profile/${profile.user_id}`)}
                                />
                            </div>
                        ) : filteredJobs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 0', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <h3>{t('no_jobs_found')}</h3>
                                <p style={{ color: '#64748b' }}>{t('try_changing')}</p>
                            </div>
                        ) : (
                            <div className="wc-job-list">
                                {filteredJobs.map(job => (
                                    <div key={job.id} id={`job-card-${job.id}`} className="wc-job-card">
                                        <div className="wc-job-main">
                                            <div className="wc-company-logo-placeholder" style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}>
                                                {job.titleUrdu?.charAt(0) || job.title?.charAt(0) || 'J'}
                                            </div>
                                            <div className="wc-job-info">
                                                <h3 style={{ fontSize: '1.4rem', color: '#4f46e5' }}>{language === 'ur' && job.titleUrdu ? job.titleUrdu : job.title}</h3>
                                                <div className="wc-job-meta">
                                                    <span
                                                        className="wc-company-name"
                                                        style={{ fontSize: '1.1rem', cursor: 'pointer', color: '#4f46e5', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                                        onClick={() => navigate(`/profile/${job.employer_id}`)}
                                                    >
                                                        <span style={{ background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', borderRadius: '50%', width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                                        </span>
                                                        {job.profiles?.company_name || job.profiles?.full_name || job.titleEng || job.title}
                                                        {job.profiles?.avg_rating > 0 && (
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: '#fffbeb', color: '#d97706', padding: '1px 6px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, marginLeft: '4px' }}>
                                                                ⭐ {Number(job.profiles.avg_rating).toFixed(1)} <span style={{ color: '#b45309', fontWeight: 500 }}>({job.profiles.total_reviews})</span>
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="wc-separator">•</span>
                                                    <span className="wc-location">{job.location}</span>
                                                </div>
                                            </div>
                                            <div className="wc-job-actions">
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => handleApply(job.id)}
                                                    style={{ padding: '0.75rem 2rem' }}
                                                >
                                                    {t('btn_apply')}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="wc-job-footer">
                                            <div className="wc-job-tags">
                                                <span className="wc-salary-tag" style={{ fontSize: '1rem' }}>💰 {job.hourly_rate || job.salary_range || 'N/A'}</span>
                                                <span className="wc-type-tag" style={{ fontSize: '1rem' }}>⏱ {job.duration || 'N/A'}</span>
                                                {job.skills && <span className="wc-skill-tag" style={{ fontSize: '0.9rem' }}>🛠 {job.skills}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* --- My Active Jobs Tab --- */}
                {activeTab === 'my-jobs' && (
                    <section className="wc-job-results">
                        <div className="wc-results-header">
                            <h2>{t('my_jobs_header')}</h2>
                        </div>

                        {loadingApps ? (
                            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>{t('loading_apps')}</div>
                        ) : myApps.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 0', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <h3>{t('no_apps_yet')}</h3>
                                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setActiveTab('find-jobs')}>{t('btn_browse_jobs')}</button>
                            </div>
                        ) : (
                            <div className="wc-job-list">
                                {myApps.map(app => (
                                    <div key={app.id} className="wc-job-card" style={{ borderLeft: app.status === 'Completed' ? '5px solid #10b981' : app.status === 'In Progress' ? '5px solid #3b82f6' : '5px solid #cbd5e1' }}>
                                        <div className="wc-job-main">
                                            <div className="wc-job-info">
                                                <h3 style={{ fontSize: '1.2rem', color: '#1e293b' }}>{language === 'ur' && app.jobs?.titleUrdu ? app.jobs?.titleUrdu : (app.jobs?.title || t('unknown_job'))}</h3>
                                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                                    {app.jobs?.location} • {app.jobs?.hourly_rate || app.jobs?.salary_range}
                                                    {app.jobs?.duration && ` • ⏳ ${app.jobs.duration}`}
                                                </p>
                                                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span className={`badge ${app.status === 'Completed' ? 'badge-green' : app.status === 'In Progress' ? 'badge-blue' : app.status === 'Offered' ? 'badge-purple' : 'badge-gray'}`}>
                                                        {t('status_label')} {app.status}
                                                    </span>

                                                    {app.status === 'Offered' && (
                                                        <>
                                                            <button
                                                                className="btn btn-primary btn-sm"
                                                                style={{ backgroundColor: '#10b981', borderColor: '#10b981', padding: '2px 8px', fontSize: '0.8rem' }}
                                                                onClick={() => handleOfferResponse(app.id, 'In Progress')}
                                                            >
                                                                ✅ {t('btn_accept_offer')}
                                                            </button>
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', padding: '2px 8px', fontSize: '0.8rem', color: 'white' }}
                                                                onClick={() => handleOfferResponse(app.id, 'Rejected')}
                                                            >
                                                                ❌ {t('btn_reject_offer')}
                                                            </button>
                                                        </>
                                                    )}

                                                    {app.status === 'Completed' && (
                                                        <button
                                                            className="btn btn-outline-light btn-sm"
                                                            style={{ color: '#fbbf24', borderColor: '#fbbf24', padding: '2px 8px', background: '#fffbeb' }}
                                                            onClick={() => openRatingModal(app)}
                                                        >
                                                            {t('btn_rate_employer')}
                                                        </button>
                                                    )}

                                                    {app.status === 'In Progress' && (app.jobs?.latitude || app.jobs?.location) && (
                                                        <a
                                                            href={`https://www.google.com/maps/dir/?api=1&destination=${app.jobs.latitude && app.jobs.longitude ? `${app.jobs.latitude},${app.jobs.longitude}` : encodeURIComponent(app.jobs.location)}`}
                                                            target="_blank" rel="noopener noreferrer"
                                                            className="btn btn-primary btn-sm"
                                                            style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', border: '1px solid #bfdbfe', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                        >
                                                            {app.jobs.latitude && app.jobs.longitude ? '📍 Navigate to GPS Pin' : '🗺️ Navigate to Address'}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* --- My Ratings Tab --- */}
                {activeTab === 'my-ratings' && (
                    <section className="wc-job-results">
                        <div className="wc-results-header">
                            <h2>{t('my_ratings_header')}</h2>
                        </div>

                        {loadingRatings ? (
                            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>{t('loading_ratings')}</div>
                        ) : myRatings.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 0', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <h3>{t('no_ratings_yet')}</h3>
                                <p style={{ color: '#64748b' }}>{t('complete_jobs_prompt')}</p>
                            </div>
                        ) : (
                            <div className="ratings-list">
                                {myRatings.map(rating => (
                                    <div key={rating.id} className="rating-card">
                                        <div className="rating-header">
                                            <span className="rating-author">{t('feedback_from')}</span>
                                            <span className="rating-date">{new Date(rating.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <StarRating rating={rating.rating} size="20px" readonly={true} />
                                        {rating.comment && (
                                            <p className="rating-comment">"{rating.comment}"</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* Rating Modal */}
                {showRatingModal && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '500px' }}>
                            <h2>{t('rate_employer_title')}</h2>
                            <p style={{ marginBottom: '1rem', color: '#666' }}>
                                {t('rate_employer_subtitle')} <strong>{language === 'ur' && ratingData.app?.jobs?.titleUrdu ? ratingData.app?.jobs?.titleUrdu : ratingData.app?.jobs?.title}</strong>?
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <StarRating
                                    rating={ratingData.rating}
                                    onChange={(r) => setRatingData({ ...ratingData, rating: r })}
                                    size="40px"
                                />
                            </div>

                            <div className="form-group">
                                <label>{t('comment_optional')}</label>
                                <textarea
                                    className="form-input"
                                    rows="3"
                                    value={ratingData.comment}
                                    onChange={(e) => setRatingData({ ...ratingData, comment: e.target.value })}
                                    placeholder={t('comment_placeholder')}
                                />
                            </div>

                            <div className="modal-actions">
                                <button className="btn btn-secondary" onClick={() => setShowRatingModal(false)}>{t('btn_cancel')}</button>
                                <button className="btn btn-primary" onClick={handleSubmitReview}>{t('btn_submit_review')}</button>
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

            {/* Voice Search Overlay (Module 10) */}
            <VoiceSearchOverlay
                isOpen={showVoiceOverlay}
                onClose={() => setShowVoiceOverlay(false)}
                onResult={handleVoiceResult}
                language={language}
                exampleHint={language === 'ur' ? 'مثال: "پلمبر کا کام لاہور میں"' : 'Example: "Plumber job in Lahore"'}
            />

            {/* Floating Language Toggle */}
            <button
                onClick={handleLangToggle}
                className="btn"
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '20px',
                    zIndex: 1000,
                    fontWeight: 'bold',
                    padding: '8px 16px',
                    border: '1px solid #4f46e5',
                    backgroundColor: 'white',
                    color: '#4f46e5',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    borderRadius: '30px',
                    cursor: 'pointer'
                }}
            >
                {language === 'en' ? 'اردو' : 'English'}
            </button>

            {/* Chat Widget Overlay */}
            <ChatWidget currentUser={user} />
        </div>
    );
};

export default BlueCollarDashboard;
