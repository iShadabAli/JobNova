import toast from 'react-hot-toast';
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';
import { parseVoiceCommand } from '../utils/voiceCommandParser';
import StarRating from '../components/StarRating';
import NotificationBell from '../components/NotificationBell';
import ComplaintModal from '../components/ComplaintModal';
import VoiceSearchOverlay from '../components/VoiceSearchOverlay';
import ChatWidget from '../components/ChatWidget';

const translations = {
    en: {
        toggle_lang: 'اردو',
        nav_find_jobs: 'Find Jobs',
        nav_my_jobs: 'My Applications',
        nav_profile: 'Profile',
        nav_hello: 'Hi',
        nav_logout: 'Logout',
        hero_title: 'Find your next professional opportunity',
        search_placeholder: 'Search by job title, skill, or location...',
        filter_all: 'All Types',
        filter_full: 'Full-time',
        filter_part: 'Part-time',
        filter_contract: 'Contract',
        btn_search: 'Search',
        jobs_found: 'Jobs Found',
        sort_by: 'Sort by:',
        relevance: 'Relevance',
        loading_jobs: 'Loading professional jobs...',
        no_jobs: 'No jobs found matching your criteria',
        try_adjusting: 'Try adjusting your search terms or filters',
        verified_employer: 'Verified Employer',
        btn_apply_now: 'Apply Now',
        salary_competitive: 'Competitive',
        type_permanent: 'Permanent',
        my_apps_title: 'My Applications',
        total_applied: 'Total Applied:',
        loading_apps: 'Loading your applications...',
        no_apps_yet: "You haven't applied to any jobs yet",
        head_back: "Head back to the Find Jobs tab to start applying.",
        btn_browse_jobs: 'Browse Jobs',
        applied_on: 'Applied on',
        status_pending: 'Pending Review',
        status_shortlisted: 'Shortlisted',
        status_rejected: 'Not Selected',
        status_accepted: 'Offer Extended',
        apply_modal_title: 'Submit Application',
        apply_modal_desc: 'Please upload your latest resume and provide a brief cover letter.',
        upload_cv_label: 'Upload CV (PDF/Word)',
        upload_cv_desc: 'Please upload your latest resume. Max size 5MB.',
        cover_letter_label: 'Cover Letter (Optional)',
        cover_letter_placeholder: 'Why are you a great fit for this role?',
        btn_cancel: 'Cancel',
        btn_submitting: 'Submitting...',
        btn_submit_app: 'Submit Application',
        alert_cv_fail: 'Failed to upload CV',
        alert_app_success: 'Application submitted successfully!',
        alert_app_fail: 'Failed to apply',
        unknown_job: 'Unknown Job',
        jobnova_listing: 'JobNova Pro listing',
        btn_rate_employer: 'Rate Employer ⭐',
        rate_employer_title: 'Rate Employer',
        rate_employer_subtitle: 'How was your experience working for',
        comment_optional: 'Comment (Optional)',
        comment_placeholder: 'Share your feedback...',
        btn_submit_review: 'Submit Review',
        alert_review_success: 'Review submitted successfully!',
        alert_review_fail: 'Failed to submit review',
        tooltip_mic: 'Search by Voice',
        listening: 'Listening...',
        voice_error: 'Speech recognition failed. Please try again.'
    },
    ur: {
        toggle_lang: 'English',
        nav_find_jobs: 'نوکریاں تلاش کریں',
        nav_my_jobs: 'میری درخواستیں',
        nav_profile: 'پروفائل',
        nav_hello: 'خوش آمدید',
        nav_logout: 'لاگ آؤٹ',
        hero_title: 'اپنا اگلا پیشہ ورانہ موقع تلاش کریں',
        search_placeholder: 'نوکری، مہارت، یا مقام کے لحاظ سے تلاش کریں...',
        filter_all: 'تمام اقسام',
        filter_full: 'کل وقتی (Full-time)',
        filter_part: 'جز وقتی (Part-time)',
        filter_contract: 'معاہدہ (Contract)',
        btn_search: 'تلاش کریں',
        jobs_found: 'نوکریاں مل گئیں',
        sort_by: 'ترتیب:',
        relevance: 'مطابقت',
        loading_jobs: 'پیشہ ورانہ نوکریاں تلاش کی جا رہی ہیں...',
        no_jobs: 'آپ کی تلاش کے مطابق کوئی نوکری نہیں ملی',
        try_adjusting: 'اپنی تلاش تبدیل کر کے دیکھیں۔',
        verified_employer: 'تصدیق شدہ آجر',
        btn_apply_now: 'ابھی درخواست دیں',
        salary_competitive: 'مسابقتی (Competitive)',
        type_permanent: 'مستقل (Permanent)',
        my_apps_title: 'میری درخواستیں',
        total_applied: 'کل درخواستیں:',
        loading_apps: 'آپ کی درخواستیں تلاش کی جا رہی ہیں...',
        no_apps_yet: "آپ نے ابھی تک کسی نوکری کے لیے درخواست نہیں دی۔",
        head_back: "درخواست دینے کے لیے نوکریاں تلاش کریں ٹیب پر واپس جائیں۔",
        btn_browse_jobs: 'نوکریاں تلاش کریں',
        applied_on: 'درخواست کی تاریخ',
        status_pending: 'جائزہ لیا جا رہا ہے',
        status_shortlisted: 'منتخب (Shortlisted)',
        status_rejected: 'منتخب نہیں ہوا',
        status_accepted: 'پیشکش کی گئی',
        apply_modal_title: 'درخواست جمع کرائیں',
        apply_modal_desc: 'براہ کرم اپنا تازہ ترین ریزیومے اور ایک مختصر کور لیٹر اپ لوڈ کریں۔',
        upload_cv_label: 'سی وی اپ لوڈ کریں (PDF/Word)',
        upload_cv_desc: 'براہ کرم اپنا تازہ ترین ریزیومے اپ لوڈ کریں۔ زیادہ سے زیادہ سائز 5MB۔',
        cover_letter_label: 'کور لیٹر (اختیاری)',
        cover_letter_placeholder: 'آپ اس کردار کے لیے کیوں موزوں ہیں؟',
        btn_cancel: 'منسوخ کریں',
        btn_submitting: 'جمع ہو رہا ہے...',
        btn_submit_app: 'درخواست جمع کرائیں',
        alert_cv_fail: 'سی وی اپ لوڈ کرنے میں مسٔلہ پیش آیا',
        alert_app_success: 'درخواست کامیابی سے جمع ہو گئی!',
        alert_app_fail: 'درخواست جمع کرنے میں مسٔلہ پیش آیا',
        unknown_job: 'نامعلوم کام',
        jobnova_listing: 'جاب نووا پرو لسٹنگ',
        btn_rate_employer: 'ریٹنگ دیں ⭐',
        rate_employer_title: 'آجر کو ریٹنگ دیں',
        rate_employer_subtitle: 'آپ کا کام کرنے کا تجربہ کیسا رہا؟',
        comment_optional: 'تبصرہ (اختیاری)',
        comment_placeholder: 'اپنا فیڈبیک دیں...',
        btn_submit_review: 'ریٹنگ جمع کرائیں',
        alert_review_success: 'ریٹنگ جمع ہو گئی!',
        alert_review_fail: 'ریٹنگ جمع کرنے میں مسٔلہ پیش آیا',
        tooltip_mic: 'آواز سے تلاش کریں',
        listening: 'سن رہا ہے...',
        voice_error: 'آواز کی شناخت ناکام ہو گئی۔ براہ کرم دوبارہ کوشش کریں۔'
    }
};

const WhiteCollarDashboard = ({ user, logout }) => {
    // --- State: Language ---
    const [language] = useState(() => {
        const savedLang = localStorage.getItem('jobnova_preferred_language');
        return savedLang ? savedLang : 'en'; // Default to English for White Collar
    });
    const t = (key) => translations[language][key] || key;

    // --- State: General Navigation ---
    const [activeTab, setActiveTab] = useState('find-jobs'); // 'find-jobs' or 'my-jobs'
    const [profileName, setProfileName] = useState('');

    // --- State: Find Jobs ---
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [isSearchingAI, setIsSearchingAI] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);

    // --- State: My Applications ---
    const [myApps, setMyApps] = useState([]);
    const [loadingApps, setLoadingApps] = useState(false);

    const [showApplyModal, setShowApplyModal] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [applyData, setApplyData] = useState({ resume_url: '', cover_letter: '', cvFile: null });
    const [applying, setApplying] = useState(false);

    // --- State: Support Modal ---
    const [showComplaintModal, setShowComplaintModal] = useState(false);

    // --- State: Rating Modal ---
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingData, setRatingData] = useState({ rating: 5, comment: '', app: null });

    const navigate = useNavigate();

    // Helper to get display name from email
    const getDisplayName = () => {
        if (user?.first_name) return user.first_name;
        if (profileName) return profileName;
        if (user?.email) {
            const namePart = user.email.split('@')[0];
            return namePart.charAt(0).toUpperCase() + namePart.slice(1);
        }
        return user?.phone || 'Professional';
    };

    // --- Fetch Data ---
    const fetchJobs = useCallback(async () => {
        setLoadingJobs(true);
        setIsSearchingAI(!!searchTerm); // Show AI processing state if there's a search term
        try {
            const token = sessionStorage.getItem('token');
            let url = 'http://localhost:5000/api/jobs/match?type=white';
            
            if (searchTerm && searchTerm.trim() !== '') {
                url += url.includes('?') ? `&search=${encodeURIComponent(searchTerm)}` : `?search=${encodeURIComponent(searchTerm)}`;
            }

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setJobs(data);
                setFilteredJobs(data);
            }
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoadingJobs(false);
            setIsSearchingAI(false);
        }
    }, [searchTerm]);

    // Initial Load for Profile and Apps
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
                }
            } catch (error) {
                console.error('Error fetching profile', error);
            }
        };

        const fetchMyApps = async () => {
            setLoadingApps(true);
            try {
                const token = sessionStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/jobs/applications/my-applications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setMyApps(data);
                }
            } catch (error) {
                console.error('Failed to fetch applications:', error);
            } finally {
                setLoadingApps(false);
            }
        };

        fetchProfile();
        fetchMyApps();
    }, []);

    // Initial Load & Search Trigger for Jobs
    useEffect(() => {
        fetchJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Handle Search & Filter ---
    useEffect(() => {
        let result = jobs;
        if (filterType !== 'All') {
            result = result.filter(job =>
                job.duration && job.duration.toLowerCase().includes(filterType.toLowerCase())
            );
        }
        setFilteredJobs(result);
    }, [filterType, jobs]);

    // --- Handle Apply Flow ---
    const openApplyModal = (jobId) => {
        setSelectedJobId(jobId);
        setShowApplyModal(true);
    };

    const submitApplication = async (e) => {
        e.preventDefault();
        setApplying(true);
        try {
            const token = sessionStorage.getItem('token');
            let uploadedResumeUrl = '';

            // 1. Upload CV if provided
            if (applyData.cvFile) {
                const formData = new FormData();
                formData.append('cv', applyData.cvFile);

                const cvResponse = await fetch('http://localhost:5000/api/profile/upload-cv', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (cvResponse.ok) {
                    const cvResult = await cvResponse.json();
                    uploadedResumeUrl = cvResult.resume_url;
                } else {
                    toast.error(t('alert_cv_fail'));
                    setApplying(false);
                    return;
                }
            }

            // 2. Submit Application
            const response = await fetch(`http://localhost:5000/api/jobs/${selectedJobId}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    resume_url: uploadedResumeUrl,
                    cover_letter: applyData.cover_letter
                })
            });

            if (response.ok) {
                toast.success(t('alert_app_success'));
                setShowApplyModal(false);
                setApplyData({ cvFile: null, cover_letter: '' });
                // Refresh Apps
                const appsRes = await fetch('http://localhost:5000/api/jobs/applications/my-applications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (appsRes.ok) setMyApps(await appsRes.json());

                // Switch to my apps tab to see it
                setActiveTab('my-jobs');
            } else {
                const err = await response.json();
                toast.error(err.message || t('alert_app_fail'));
            }
        } catch (error) {
            console.error('Error applying:', error);
            toast.error(t('alert_app_fail'));
        } finally {
            setApplying(false);
        }
    };

    // --- Handle Rating Flow ---
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


    // --- Render Helpers ---
    const renderStatusBadge = (status) => {
        switch (status) {
            case 'Pending':
                return <span className="status-badge status-pending">{t('status_pending')}</span>;
            case 'Shortlisted':
                return <span className="status-badge status-progress">{t('status_shortlisted')}</span>;
            case 'Rejected':
                return <span className="status-badge status-cancelled">{t('status_rejected')}</span>;
            case 'Accepted':
                return <span className="status-badge status-completed">{t('status_accepted')}</span>;
            default:
                return <span className="status-badge">{status}</span>;
        }
    };
    
    // --- Voice Search Handler (Module 10) ---
    const handleVoiceResult = useCallback((transcript) => {
        setShowVoiceOverlay(false);
        if (!transcript || !transcript.trim()) return;

        const parsed = parseVoiceCommand(transcript);
        setSearchTerm(parsed.searchText);

        if (parsed.durationFilter) {
            setFilterType(parsed.durationFilter);
        }

        setActiveTab('find-jobs');
    }, []);

    return (
        <div className="wc-dashboard-container" dir={language === 'ur' ? 'rtl' : 'ltr'}>
            {/* Top Navigation Bar */}
            <nav className="wc-navbar">
                <div className="wc-nav-brand">JobNova Pro</div>
                <div className="wc-nav-links">
                    <button
                        className={`wc-nav-btn ${activeTab === 'find-jobs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('find-jobs')}
                    >
                        {t('nav_find_jobs')}
                    </button>
                    <button
                        className={`wc-nav-btn ${activeTab === 'my-jobs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('my-jobs')}
                    >
                        {t('nav_my_jobs')}
                    </button>
                    <Link to="/profile" className="wc-nav-link">{t('nav_profile')}</Link>
                </div>
                <div className="wc-user-menu" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>

                    <NotificationBell language={language} />
                    <span className="wc-user-greeting">{t('nav_hello')}, {getDisplayName()}</span>
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

            {/* Main Content Area */}
            <main className="wc-main-content">

                {/* -------------------- FIND JOBS TAB -------------------- */}
                {activeTab === 'find-jobs' && (
                    <>
                        {/* Search Section */}
                        <section className="wc-search-section">
                            <h1>{t('hero_title')}</h1>
                            <div className="wc-search-bar">
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
                                    <input
                                        type="text"
                                        placeholder={t('search_placeholder')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') fetchJobs();
                                        }}
                                        style={{ 
                                            width: '100%',
                                            paddingRight: '6rem'
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
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="wc-filter-select"
                                >
                                    <option value="All">{t('filter_all')}</option>
                                    <option value="Full-time">{t('filter_full')}</option>
                                    <option value="Part-time">{t('filter_part')}</option>
                                    <option value="Contract">{t('filter_contract')}</option>
                                </select>
                            </div>
                        </section>

                        {/* Job Results */}
                        <section className="wc-job-results">
                            <div className="wc-results-header">
                                <h2>{filteredJobs.length} {t('jobs_found')}</h2>
                                <span className="wc-sort-label">{t('sort_by')} <strong>{t('relevance')}</strong></span>
                            </div>

                            {isSearchingAI ? (
                                <div className="loading-state">
                                    <div className="spinner" style={{ borderTopColor: '#4f46e5' }}></div>
                                    <p style={{ color: '#4f46e5', fontWeight: 600 }}>AI Translating & Searching... 🧠</p>
                                </div>
                            ) : loadingJobs ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>{t('loading_jobs')}</p>
                                </div>
                            ) : filteredJobs.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">🔍</div>
                                    <h3>{t('no_jobs')}</h3>
                                    <p>{t('try_adjusting')}</p>
                                </div>
                            ) : (
                                <div className="wc-job-list">
                                    {filteredJobs.map(job => (
                                        <div key={job.id} className="wc-job-card">
                                            <div className="wc-job-main">
                                                <div className="wc-company-logo-placeholder">{job.title ? job.title.charAt(0).toUpperCase() : 'J'}</div>
                                                <div className="wc-job-info">
                                                    <h3>{job.title}</h3>
                                                    <div className="wc-job-meta">
                                                        <span
                                                            className="wc-company-name"
                                                            style={{ cursor: 'pointer', color: '#4f46e5', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                                            onClick={() => navigate(`/profile/${job.employer_id}`)}
                                                            title="View Employer Profile"
                                                        >
                                                            <span style={{ background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', borderRadius: '50%', width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                                            </span>
                                                            {job.profiles?.company_name || job.profiles?.full_name || t('verified_employer')}
                                                            {job.profiles?.avg_rating > 0 && (
                                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: '#fffbeb', color: '#d97706', padding: '1px 6px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, marginLeft: '4px' }}>
                                                                    ⭐ {Number(job.profiles.avg_rating).toFixed(1)} <span style={{ color: '#b45309', fontWeight: 500 }}>({job.profiles.total_reviews})</span>
                                                                </span>
                                                            )}
                                                        </span>
                                                        <span className="wc-separator">•</span>
                                                        <span className="wc-location">{job.location}</span>
                                                        <span className="wc-separator">•</span>
                                                        <span className="wc-posted">{new Date(job.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="wc-job-actions">
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => openApplyModal(job.id)}
                                                    >
                                                        {t('btn_apply_now')}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="wc-job-footer">
                                                <div className="wc-job-tags">
                                                    <span className="wc-salary-tag">💰 {job.salary_range || t('salary_competitive')}</span>
                                                    <span className="wc-type-tag">💼 {t('type_permanent')}</span>
                                                    {job.skills && job.skills.split(',').slice(0, 3).map((tag, idx) => (
                                                        <span key={idx} className="wc-skill-tag">{tag.trim()}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}

                {/* -------------------- MY APPLICATIONS TAB -------------------- */}
                {activeTab === 'my-jobs' && (
                    <section className="wc-job-results">
                        <div className="wc-results-header">
                            <h2>{t('my_apps_title')}</h2>
                            <span className="wc-sort-label">{t('total_applied')} <strong>{myApps.length}</strong></span>
                        </div>

                        {loadingApps ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>{t('loading_apps')}</p>
                            </div>
                        ) : myApps.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📝</div>
                                <h3>{t('no_apps_yet')}</h3>
                                <p>{t('head_back')}</p>
                                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setActiveTab('find-jobs')}>
                                    {t('btn_browse_jobs')}
                                </button>
                            </div>
                        ) : (
                            <div className="wc-job-list">
                                {myApps.map(app => (
                                    <div key={app.id} className="wc-job-card">
                                        <div className="wc-job-main" style={{ alignItems: 'center' }}>
                                            <div className="wc-company-logo-placeholder" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>
                                                {app.jobs?.title ? app.jobs.title.charAt(0).toUpperCase() : 'J'}
                                            </div>
                                            <div className="wc-job-info">
                                                <h3>{app.jobs?.title || t('unknown_job')}</h3>
                                                <div className="wc-job-meta">
                                                    <span className="wc-company-name">{t('jobnova_listing')}</span>
                                                    <span className="wc-separator">•</span>
                                                    <span className="wc-location">{t('applied_on')} {new Date(app.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="wc-job-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {renderStatusBadge(app.status)}
                                                {app.status === 'Completed' && (
                                                    <button
                                                        className="btn btn-outline-light btn-sm"
                                                        style={{ color: '#fbbf24', borderColor: '#fbbf24', padding: '2px 8px', background: '#fffbeb', width: 'fit-content', marginLeft: 'auto' }}
                                                        onClick={() => openRatingModal(app)}
                                                    >
                                                        {t('btn_rate_employer')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="wc-job-footer" style={{ borderTop: 'none', paddingTop: '0' }}>
                                            {app.cover_letter && (
                                                <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '10px', fontStyle: 'italic' }}>
                                                    " {app.cover_letter.substring(0, 100)}{app.cover_letter.length > 100 ? '...' : ''} "
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </main>

            {/* -------------------- APPLY MODAL -------------------- */}
            {showApplyModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <h2>{t('apply_modal_title')}</h2>
                        <p style={{ color: '#64748b', marginBottom: '20px' }}>
                            {t('apply_modal_desc')}
                        </p>

                        <form onSubmit={submitApplication}>
                            <div className="form-group">
                                <label style={{ fontWeight: '600' }}>{t('upload_cv_label')}</label>
                                <div className="file-upload-wrapper" style={{ position: 'relative', overflow: 'hidden', display: 'inline-block', width: '100%', marginTop: '5px' }}>
                                    <input
                                        type="file"
                                        id="cv-upload-input"
                                        className="form-input"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => setApplyData({ ...applyData, cvFile: e.target.files[0] })}
                                        required
                                        style={{ display: 'none' }}
                                    />
                                    <label
                                        htmlFor="cv-upload-input"
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
                                        {applyData.cvFile ? `✅ Selected: ${applyData.cvFile.name}` : '📁 Click to Browse & Upload CV'}
                                    </label>
                                </div>
                                <small style={{ color: '#64748b', display: 'block', marginTop: '5px' }}>
                                    {t('upload_cv_desc')}
                                </small>
                            </div>

                            <div className="form-group" style={{ marginTop: '20px' }}>
                                <label style={{ fontWeight: '600' }}>{t('cover_letter_label')}</label>
                                <textarea
                                    className="form-input"
                                    rows="5"
                                    placeholder={t('cover_letter_placeholder')}
                                    value={applyData.cover_letter}
                                    onChange={(e) => setApplyData({ ...applyData, cover_letter: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="modal-actions" style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowApplyModal(false)}
                                    disabled={applying}
                                >
                                    {t('btn_cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={applying}
                                >
                                    {applying ? t('btn_submitting') : t('btn_submit_app')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
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
                exampleHint={language === 'ur' ? 'مثال: "سافٹ ویئر انجینئر"' : 'Example: "Software Engineer"'}
            />

            {/* Chat Widget Overlay */}
            <ChatWidget currentUser={user} />
        </div>
    );
};

export default WhiteCollarDashboard;
