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
        voice_error: 'Speech recognition failed. Please try again.',
        te_header: 'Time Exchange ✈️',
        te_subtitle: 'Travel and Work Explorer',
        te_announce_btn: 'Announce My Travel',
        te_from_label: 'From City',
        te_to_label: 'To City',
        te_start_label: 'Start Date',
        te_end_label: 'End Date',
        te_available_check: 'Available for work during travel?',
        te_post_btn: 'Post Travel Announcement',
        te_my_announcements: 'My Travel Announcements 📋',
        te_no_announcements: "You haven't posted any travel plans yet.",
        te_networking: 'Travelers to my Destination 🌍',
        te_no_networking: 'No other travelers found for your destination yet.',
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
    const [activeTab, _setActiveTab] = useState(() => {
        const lastUser = sessionStorage.getItem('wc_lastUser');
        if (lastUser !== user?.id) { sessionStorage.setItem('wc_activeTab', 'welcome'); sessionStorage.setItem('wc_lastUser', user?.id); return 'welcome'; }
        return sessionStorage.getItem('wc_activeTab') || 'welcome';
    });

    const handleTabChange = (tab) => { 
        sessionStorage.setItem('wc_activeTab', tab); 
        _setActiveTab(tab); 
        window.history.pushState({ tab }, '', `#${tab}`); 
        if (tab === 'time-exchange') { 
            fetchMyTravel(); 
            fetchTERequests(); 
        } 
    };
        const fetchMyTravel = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/time-exchange/user/${user.id}`);
            const result = await res.json();
            if (result.success) setTravelAnnouncements(result.data);
        } catch (err) { console.error('Error fetching travel:', err); }
    };

    const fetchNetworking = async (toCity) => {
        if (!toCity) return;
        try {
            const res = await fetch(`http://localhost:5000/api/time-exchange?to_city=${toCity}`);
            const result = await res.json();
            if (result.success) {
                setNetworkingTravelers(result.data.filter(t => t.user_id !== user.id));
            }
        } catch (err) { console.error('Error fetching networking:', err); }
    };

    const handlePostTravel = async (e) => {
        e.preventDefault();
        setLoadingTE(true);
        try {
            const res = await fetch('http://localhost:5000/api/time-exchange', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...travelForm, user_id: user.id })
            });
            const result = await res.json();
            if (result.success) {
                toast.success('Travel announcement posted!');
                setTravelForm({ from_city: '', to_city: '', travel_date_start: '', travel_date_end: '', available_for_work: true, skills: user?.skills || '' });
                fetchMyTravel();
            } else { toast.error(result.error); }
        } catch (err) { toast.error('Connection error'); }
        finally { setLoadingTE(false); }
    };

        const handleDeleteTravel = async (id) => {
        toast((t) => (
            <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 12px 0', fontWeight: 600, color: '#1e293b' }}>
                    {language === 'ur' ? 'کیا آپ اس اعلان کو حذف کرنا چاہتے ہیں؟' : 'Delete this travel announcement?'}
                </p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                const res = await fetch(`http://localhost:5000/api/time-exchange/${id}`, { method: 'DELETE' });
                                const result = await res.json();
                                if (result.success) {
                                    toast.success(language === 'ur' ? 'حذف کر دیا گیا' : 'Deleted successfully');
                                    fetchMyTravel();
                                }
                            } catch (err) { toast.error('Error deleting'); }
                        }}
                        style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                        {language === 'ur' ? 'ہاں، حذف کریں' : 'Yes, Delete'}
                    </button>
                    <button 
                        onClick={() => toast.dismiss(t.id)}
                        style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                        {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
                    </button>
                </div>
            </div>
        ), { duration: 6000, position: 'top-center', style: { borderRadius: '20px', padding: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' } });
    };

    
    const fetchTERequests = useCallback(async () => {
        if (!user?.id) return;
        setLoadingTERequests(true);
        try {
            const res = await fetch(`http://localhost:5000/api/time-exchange/requests/${user.id}`);
            const result = await res.json();
            if (result.success) setTERequests(result.data);
        } catch (err) { console.error('Error fetching TE requests:', err); }
        finally { setLoadingTERequests(false); }
    }, [user?.id]);

    useEffect(() => {
        if (activeTab === 'time-exchange') {
            fetchMyTravel();
            fetchTERequests();
        }
    }, [activeTab, fetchTERequests]);

    const handleTERequestStatus = async (requestId, status) => {
        try {
            const res = await fetch(`http://localhost:5000/api/time-exchange/requests/${requestId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const result = await res.json();
            if (result.success) {
                const msg = status === 'Accepted' 
                    ? (language === 'ur' ? 'پیشکش قبول کر لی گئی! 🤝' : 'Offer Accepted! 🤝')
                    : (language === 'ur' ? 'پیشکش مسترد کر دی گئی' : 'Offer Declined');
                
                toast.success(msg, {
                    duration: 4000,
                    icon: status === 'Accepted' ? '✅' : '❌',
                    style: { borderRadius: '15px', background: '#1e293b', color: '#fff', fontWeight: 600 }
                });
                fetchTERequests();
            }
        } catch (err) { toast.error(language === 'ur' ? 'سٹیٹس اپ ڈیٹ کرنے میں مسٔلہ پیش آیا' : 'Error updating status'); }
    };


    useEffect(() => {
        const onBack = (e) => {
            const prev = e.state?.tab;
            if (prev) { sessionStorage.setItem('wc_activeTab', prev); _setActiveTab(prev); }
            else { sessionStorage.setItem('wc_activeTab', 'welcome'); _setActiveTab('welcome'); }
        };
        window.history.replaceState({ tab: activeTab }, '');
        window.addEventListener('popstate', onBack);
        return () => window.removeEventListener('popstate', onBack);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    const [intlJobs, setIntlJobs] = useState([]);
    const [filteredIntlJobs, setFilteredIntlJobs] = useState([]);
    const [loadingIntlJobs, setLoadingIntlJobs] = useState(false);
    const [intlSearchTerm, setIntlSearchTerm] = useState('');
    const [intlCountryFilter, setIntlCountryFilter] = useState('');

    useEffect(() => {
        const fetchIntlJobs = async () => {
            setLoadingIntlJobs(true);
            try {
                const response = await fetch('http://localhost:5000/api/international-jobs');
                const result = await response.json();
                if (result.success) {
                    setIntlJobs(result.data);
                    setFilteredIntlJobs(result.data);
                }
            } catch (error) {
                console.error('Error fetching international jobs:', error);
            } finally {
                setLoadingIntlJobs(false);
            }
        };
        fetchIntlJobs();
    }, []);

    useEffect(() => {
        let filtered = intlJobs;
        if (intlSearchTerm) {
            const term = intlSearchTerm.toLowerCase();
            filtered = filtered.filter(j =>
                (j.title || '').toLowerCase().includes(term) ||
                (j.description || '').toLowerCase().includes(term) ||
                (j.city || '').toLowerCase().includes(term) ||
                (j.country || '').toLowerCase().includes(term)
            );
        }
        if (intlCountryFilter) {
            filtered = filtered.filter(j => (j.city || '').toLowerCase().includes(intlCountryFilter.toLowerCase()));
        }
        setFilteredIntlJobs(filtered);
    }, [intlSearchTerm, intlCountryFilter, intlJobs]);

    const [profileName, setProfileName] = useState('');
    const [profileAvatar, setProfileAvatar] = useState('');

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
    
    const [teRequests, setTERequests] = useState([]);
    const [loadingTERequests, setLoadingTERequests] = useState(false);
const [travelAnnouncements, setTravelAnnouncements] = useState([]);
    const [networkingTravelers, setNetworkingTravelers] = useState([]);
    const [loadingTE, setLoadingTE] = useState(false);
    const [travelForm, setTravelForm] = useState({
        from_city: '',
        to_city: '',
        travel_date_start: '',
        travel_date_end: '',
        available_for_work: true,
        skills: user?.skills || ''
    });

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
                    if (data.avatar_url) {
                        setProfileAvatar(data.avatar_url);
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
                handleTabChange('my-jobs');
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

        handleTabChange('find-jobs');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const handleApplyIntlJob = async (jobId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/international-jobs/${jobId}/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicant_id: user.id })
            });
            const result = await response.json();
            if (result.success) {
                toast.success(language === 'ur' ? 'درخواست کامیابی کے ساتھ بھیجی گئی!' : 'Successfully applied for international job!');
            } else {
                toast.error(result.error || (language === 'ur' ? 'درخواست دینے میں ناکامی' : 'Failed to apply'));
            }
        } catch (error) {
            console.error('Error applying for intl job:', error);
            toast.error('Network error. Please try again.');
        }
    };

    return (
        <div className="wc-dashboard-container" dir={language === 'ur' ? 'rtl' : 'ltr'}>
            {/* Top Navigation Bar */}
            <nav className="wc-navbar">
                <div 
                    className="wc-nav-brand" 
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                    onClick={() => handleTabChange('welcome')}
                    title="JobNova Pro Dashboard"
                >
                    <div style={{ background: '#4f46e5', padding: '6px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.5px', color: '#1e293b' }}>
                        JobNova <span style={{ color: '#4f46e5' }}>Pro</span>
                    </span>
                </div>
                <div className="wc-nav-links"></div>
                <div className="wc-user-menu" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px', marginRight: '10px' }}>
                        <Link to="/about" className="wc-nav-link" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>About Us</Link>
                        <Link to="/contact" className="wc-nav-link" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>Contact Us</Link>
                    </div>

                    <NotificationBell language={language} />
                    <span className="wc-user-greeting" style={{ marginRight: '5px' }}>{t('nav_hello')}, {getDisplayName()}</span>
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

                                {/* -------------------- WELCOME VIEW -------------------- */}
                {activeTab === 'welcome' && (
                    <section className="wc-welcome-section">
                        <div className="wc-welcome-hero">
                            <h1>Welcome back, {getDisplayName()}! 👋</h1>
                            <p>What would you like to do today?</p>
                        </div>
                        <div className="wc-dashboard-grid">
                            <div className="wc-dash-card" onClick={() => handleTabChange('find-jobs')}>
                                <div className="wc-dash-card-icon">🔍</div>
                                <h3>Find Jobs</h3>
                                <p>Browse and apply for professional roles</p>
                            </div>
                            <div className="wc-dash-card" onClick={() => handleTabChange('my-jobs')}>
                                <div className="wc-dash-card-icon">📋</div>
                                <h3>My Applications</h3>
                                <p>Track your applied jobs and offers</p>
                            </div>
                            <div className="wc-dash-card" onClick={() => handleTabChange('international-jobs')}>
                                <div className="wc-dash-card-icon">🌍</div>
                                <h3>International Jobs</h3>
                                <p>Browse overseas corporate opportunities</p>
                            </div>
                            <div className="wc-dash-card" onClick={() => handleTabChange('time-exchange')}>
                                <div className="wc-dash-card-icon">✈️</div>
                                <h3>{t('te_header')}</h3>
                                <p>{t('te_subtitle')}</p>
                            </div>
                            <div className="wc-dash-card disabled" onClick={() => toast('Scholarships portal coming soon!')}>
                                <div className="wc-dash-card-icon">🎓</div>
                                <h3>Scholarships</h3>
                                <p>Coming soon: Explore educational opportunities</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* -------------------- INTERNATIONAL JOBS TAB -------------------- */}
                {activeTab === 'international-jobs' && (
                    <section style={{ padding: 0 }}>
                        {/* Hero Banner */}
                        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #2d1854 50%, #0f172a 100%)', padding: '3rem 2rem', borderRadius: '24px', marginBottom: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden', border: '1px solid rgba(139,92,246,0.15)' }}>
                            <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)', pointerEvents: 'none' }} />
                            <div style={{ position: 'absolute', bottom: '-40%', right: '-10%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(59,130,246,0.1), transparent 70%)', pointerEvents: 'none' }} />
                            <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700, position: 'relative' }}>
                                International Opportunities
                            </h1>
                            <p style={{ color: '#94a3b8', margin: '0 0 1.5rem 0', fontSize: '1rem', position: 'relative' }}>
                                Discover professional roles around the globe with visa sponsorship options
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>🔍</span>
                                    <input type="text" placeholder="Search jobs..." value={intlSearchTerm} onChange={(e) => setIntlSearchTerm(e.target.value)}
                                        style={{ width: '100%', padding: '0.85rem 0.85rem 0.85rem 2.5rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: '0.9rem', backdropFilter: 'blur(10px)', outline: 'none', transition: 'border 0.3s' }}
                                        onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>🏙️</span>
                                    <input type="text" placeholder="Filter by city..." value={intlCountryFilter} onChange={(e) => setIntlCountryFilter(e.target.value)}
                                        style={{ width: '100%', padding: '0.85rem 0.85rem 0.85rem 2.5rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: '0.9rem', backdropFilter: 'blur(10px)', outline: 'none', transition: 'border 0.3s' }}
                                        onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                                </div>
                            </div>
                            <p style={{ color: '#475569', fontSize: '0.8rem', margin: '1rem 0 0 0', position: 'relative' }}>{filteredIntlJobs.length} opportunities available</p>
                        </div>

                        {/* Job Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                            {loadingIntlJobs ? (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
                                    <p>Loading opportunities...</p>
                                </div>
                            ) : filteredIntlJobs.length > 0 ? (
                                filteredIntlJobs.map(job => (
                                    <div key={job.id} style={{ background: 'linear-gradient(145deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9))', borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}
                                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'; }}
                                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none'; }}>
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: job.type === 'blue' ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' : 'linear-gradient(90deg, #8b5cf6, #a78bfa)' }} />
                                        <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                            <span style={{ background: job.type === 'blue' ? 'rgba(59,130,246,0.12)' : 'rgba(139,92,246,0.12)', color: job.type === 'blue' ? '#60a5fa' : '#a78bfa', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600 }}>{job.type === 'blue' ? 'Blue-Collar' : 'White-Collar'}</span>
                                            {job.visa_sponsored && <span style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600 }}>Visa Sponsored</span>}
                                        </div>
                                        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', color: '#f1f5f9', fontWeight: 600, textTransform: 'capitalize' }}>{job.title}</h3>
                                        {job.employer && (
                                            <p 
                                                style={{ color: '#8b5cf6', fontSize: '0.8rem', margin: '0 0 0.75rem 0', cursor: 'pointer', fontWeight: 600 }}
                                                onClick={() => navigate(`/profile/${job.employer_id}`)}
                                                title="View Employer Profile"
                                            >
                                                🏢 Posted by {job.employer.first_name} {job.employer.last_name} (View Profile 👤)
                                            </p>
                                        )}
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                            <span style={{ color: '#94a3b8', fontSize: '0.82rem', background: 'rgba(255,255,255,0.04)', padding: '5px 12px', borderRadius: '10px' }}>{job.city ? job.city + ', ' : ''}{job.country}</span>
                                            <span style={{ color: '#4ade80', fontSize: '0.82rem', fontWeight: 600, background: 'rgba(74,222,128,0.08)', padding: '5px 12px', borderRadius: '10px' }}>{job.currency} {job.salary}</span>
                                        </div>
                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 1.25rem 0', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}>{job.description}</p>
                                        <button onClick={() => handleApplyIntlJob(job.id)} disabled={job.applied}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s', marginTop: 'auto' }}
                                            onMouseOver={e => { if(!e.currentTarget.disabled) { e.currentTarget.style.background = 'linear-gradient(135deg, #a78bfa, #8b5cf6)'; e.currentTarget.style.transform = 'scale(1.02)'; }}}
                                            onMouseOut={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)'; e.currentTarget.style.transform = 'scale(1)'; }}>
                                            Apply Now
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🌍</span>
                                    <h3 style={{ color: '#e2e8f0', margin: '0 0 0.5rem 0' }}>No jobs found</h3>
                                    <p style={{ color: '#64748b', margin: 0 }}>Try adjusting your search or filter criteria</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                                {/* -------------------- TIME EXCHANGE TAB -------------------- */}
                {activeTab === 'time-exchange' && (
                    <section className="wc-welcome-section">
                        <div className="wc-welcome-hero" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
                            <h1>{t('te_header')}</h1>
                            <p>{t('te_subtitle')}</p>
                        </div>

                        <div className="te-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                            <div className="bc-search-section" style={{ padding: '2rem', borderRadius: '24px', height: 'fit-content', background: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                <h2 style={{ color: '#1e293b', marginBottom: '1.5rem', fontSize: '1.5rem' }}>{t('te_announce_btn')}</h2>
                                <form onSubmit={handlePostTravel} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '5px', display: 'block' }}>{t('te_from_label')}</label>
                                        <input type="text" required placeholder="e.g. London" value={travelForm.from_city} onChange={e => setTravelForm({...travelForm, from_city: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '5px', display: 'block' }}>{t('te_to_label')}</label>
                                        <input type="text" required placeholder="e.g. New York" value={travelForm.to_city} onChange={e => setTravelForm({...travelForm, to_city: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '5px', display: 'block' }}>{t('te_start_label')}</label>
                                            <input type="date" required value={travelForm.travel_date_start} onChange={e => setTravelForm({...travelForm, travel_date_start: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                        </div>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '5px', display: 'block' }}>{t('te_end_label')}</label>
                                            <input type="date" required value={travelForm.travel_date_end} onChange={e => setTravelForm({...travelForm, travel_date_end: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
                                        <input type="checkbox" id="te_avail" checked={travelForm.available_for_work} onChange={e => setTravelForm({...travelForm, available_for_work: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                                        <label htmlFor="te_avail" style={{ color: '#1e293b', cursor: 'pointer' }}>{t('te_available_check')}</label>
                                    </div>
                                    <button type="submit" disabled={loadingTE} className="btn btn-primary" style={{ padding: '12px', fontWeight: 600 }}>
                                        {loadingTE ? t('btn_saving') || 'Saving...' : t('te_post_btn')}
                                    </button>
                                </form>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{ background: '#fff', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>{t('te_my_announcements')}</h2>
                                    {travelAnnouncements.length === 0 ? (
                                        <p style={{ color: '#64748b' }}>{t('te_no_announcements')}</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {travelAnnouncements.map(ann => (
                                                <div key={ann.id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{ann.from_city} ➔ {ann.to_city}</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(ann.travel_date_start).toLocaleDateString()} to {new Date(ann.travel_date_end).toLocaleDateString()}</div>
                                                        {ann.available_for_work && <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', marginTop: '4px', display: 'inline-block' }}>Available for Work</span>}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => fetchNetworking(ann.to_city)} className="btn btn-outline-primary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Find Others</button>
                                                        <button onClick={() => handleDeleteTravel(ann.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{ background: '#fff', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>{t('te_networking')}</h2>
                                    {networkingTravelers.length === 0 ? (
                                        <p style={{ color: '#64748b' }}>{t('te_no_networking')}</p>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            {networkingTravelers.map(trav => (
                                                <div key={trav.id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                                                            {trav.user?.profile_picture ? <img src={trav.user.profile_picture} alt="Profile" style={{width:'100%', height:'100%', borderRadius:'50%'}} /> : trav.user?.full_name?.charAt(0)}
                                                        </div>
                                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{trav.user?.full_name}</div>
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Arriving from: {trav.from_city}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Dates: {new Date(trav.travel_date_start).toLocaleDateString()}</div>
                                                    <button onClick={() => navigate('/profile/' + trav.user_id)} className="btn btn-primary" style={{ width: '100%', marginTop: '10px', padding: '5px', fontSize: '0.8rem' }}>View Profile</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* -------------------- TIME EXCHANGE HIRE REQUESTS -------------------- */}
                        <div style={{ marginTop: '2.5rem', background: '#fff', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #e2e8f0' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                💼 {language === 'ur' ? 'کام کی درخواستیں' : 'Work Hire Requests'}
                                {teRequests.filter(r => r.status === 'Pending').length > 0 && (
                                    <span style={{ fontSize: '0.75rem', background: '#ef4444', color: '#fff', padding: '4px 10px', borderRadius: '12px' }}>
                                        {teRequests.filter(r => r.status === 'Pending').length} NEW
                                    </span>
                                )}
                            </h2>

                            {loadingTERequests ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <div className="loading-spinner"></div>
                                </div>
                            ) : teRequests.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                    {teRequests.map(req => (
                                        <div key={req.id} style={{ background: 'white', padding: '2rem', borderRadius: '30px', border: '1px solid #e2e8f0', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                                            <div style={{ position: 'absolute', top: 0, right: 0, padding: '8px 16px', background: req.status === 'Pending' ? '#f59e0b' : req.status === 'Accepted' ? '#10b981' : '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 900, borderBottomLeftRadius: '20px', letterSpacing: '1px' }}>{req.status.toUpperCase()}</div>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
                                                <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'white', boxShadow: '0 10px 20px rgba(79,70,229,0.2)' }}>
                                                    {req.employer?.first_name?.charAt(0) || '🏢'}
                                                </div>
                                                <div>
                                                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.3rem', fontWeight: 800 }}>{req.employer?.first_name} {req.employer?.last_name}</h3>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Verified Employer</p>
                                                        <button 
                                                            onClick={() => navigate(`/profile/${req.employer_id}`)}
                                                            style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.8rem', padding: 0, cursor: 'pointer', textAlign: 'left', fontWeight: 600, textDecoration: 'underline' }}
                                                        >
                                                            {language === 'ur' ? 'آجر کی پروفائل دیکھیں' : 'View Employer Profile'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '15px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#334155', fontSize: '1rem', fontWeight: 600 }}>
                                                    <span style={{ fontSize: '1.2rem' }}>📍</span> {req.travel?.from_city}
                                                    <span style={{ color: '#94a3b8' }}>➔</span>
                                                    <span style={{ fontSize: '1.2rem' }}>🎯</span> {req.travel?.to_city}
                                                </div>
                                            </div>

                                            <div style={{ position: 'relative', marginBottom: '2rem' }}>
                                                <div style={{ position: 'absolute', left: '-10px', top: '0', bottom: '0', width: '4px', background: '#4f46e5', borderRadius: '2px' }}></div>
                                                <p style={{ margin: 0, paddingLeft: '15px', color: '#475569', fontSize: '1rem', fontStyle: 'italic', lineHeight: '1.6' }}>
                                                    "{req.message || "I'm interested in hiring you for your travel period."}"
                                                </p>
                                            </div>

                                            {req.status === 'Pending' && (
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    <button 
                                                        onClick={() => handleTERequestStatus(req.id, 'Accepted')}
                                                        style={{ flex: 2, padding: '14px', borderRadius: '18px', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(79,70,229,0.2)' }}
                                                    >
                                                        {language === 'ur' ? 'قبول کریں' : 'Accept Offer'}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleTERequestStatus(req.id, 'Rejected')}
                                                        style={{ flex: 1, padding: '14px', borderRadius: '18px', border: '1px solid #fee2e2', background: '#fff5f5', color: '#ef4444', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}
                                                    >
                                                        {language === 'ur' ? 'مسترد' : 'Decline'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem', border: '1px dashed #e2e8f0', borderRadius: '16px' }}>
                                    No requests yet.
                                </p>
                            )}
                        </div>
                    </section>
                )}

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
                                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => handleTabChange('find-jobs')}>
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
