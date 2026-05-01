import toast from 'react-hot-toast';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
        voice_error: 'Speech recognition failed. Please try again.',
        welcome_title: 'Welcome back',
        welcome_subtitle: 'What would you like to do today?',
        card_find_jobs: 'Find Jobs',
        card_find_jobs_desc: 'Browse local jobs near you',
        card_my_jobs: 'My Applications',
        card_my_jobs_desc: 'Track your applied jobs & offers',
        card_my_ratings: 'My Ratings',
        card_my_ratings_desc: 'View your employer feedback',
        card_hunarmand: 'Hunarmand',
        card_hunarmand_desc: 'Coming soon: AI skill matching',
        card_international: 'International Jobs',
        card_international_desc: 'Coming soon: Overseas opportunities',
        card_time_exchange: 'Time Exchange',
        card_time_exchange_desc: 'Coming soon: Freelance availability',
        card_bookings: 'My Bookings',
        card_bookings_desc: 'View your scheduled jobs',
        schedule_header: 'My Schedule',
        schedule_subtitle: 'Set your daily working hours',
        schedule_start: 'Start Time',
        schedule_end: 'End Time',
        btn_save_schedule: 'Save Schedule',
        card_schedule: 'My Schedule',
        card_schedule_desc: 'Set your availability & work hours',
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
        te_header: 'ٹائم ایکسچینج (Time Exchange) ✈️',
        te_subtitle: 'سفر اور کام کی معلومات',
        te_announce_btn: 'اپنے سفر کا اعلان کریں',
        te_from_label: 'کس شہر سے',
        te_to_label: 'کس شہر کو',
        te_start_label: 'روانگی کی تاریخ',
        te_end_label: 'واپسی کی تاریخ',
        te_available_check: 'کیا آپ دورانِ سفر کام کے لیے دستیاب ہیں؟',
        te_post_btn: 'سفر کا اعلان پوسٹ کریں',
        te_my_announcements: 'میرے سفر کے اعلانات 📋',
        te_no_announcements: 'آپ نے ابھی تک سفر کا کوئی اعلان نہیں کیا۔',
        te_networking: 'میرے شہر آنے والے دیگر مسافر 🌍',
        te_no_networking: 'آپ کی منزل کے لیے ابھی کوئی اور مسافر نہیں ملا۔',
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
        voice_error: 'آواز کی شناخت ناکام ہو گئی۔ براہ کرم دوبارہ کوشش کریں۔',
        welcome_title: 'خوش آمدید',
        welcome_subtitle: 'آج آپ کیا کرنا چاہیں گے؟',
        card_find_jobs: 'نئی نوکریاں',
        card_find_jobs_desc: 'اپنے قریب کام تلاش کریں',
        card_my_jobs: 'میرے کام',
        card_my_jobs_desc: 'اپنی درخواستوں کا جائزہ لیں',
        card_my_ratings: 'میری ریٹنگز',
        card_my_ratings_desc: 'آجر کی طرف سے فیڈ بیک دیکھیں',
        card_hunarmand: 'ہنرمند',
        card_hunarmand_desc: 'جلد آ رہا ہے: AI ہنر میچنگ',
        card_international: 'بیرونِ ملک نوکریاں',
        card_international_desc: 'جلد آ رہا ہے: بیرونِ ملک مواقع',
        card_time_exchange: 'ٹائم ایکسچینج',
        card_time_exchange_desc: 'جلد آ رہا ہے: فری لانس دستیابی',
        card_bookings: 'میری بکنگز',
        card_bookings_desc: 'شیڈول شدہ کام دیکھیں',
        schedule_header: 'میرا شیڈول',
        schedule_subtitle: 'کام کے اوقات مقرر کریں',
        schedule_start: 'آغاز',
        schedule_end: 'اختتام',
        btn_save_schedule: 'محفوظ کریں',
        card_schedule: 'میرا شیڈیول',
        card_schedule_desc: 'اپنی دستیابی اور اوقات مقرر کریں'
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
    const [activeTab, _setActiveTab] = useState('welcome');
    // Handle Back Button
    useEffect(() => {
        const handlePopState = () => {
            const hash = window.location.hash.replace('#', '') || 'welcome';
            _setActiveTab(hash);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

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
                // Filter out current user
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

    const handleTabChange = (tab) => {
        _setActiveTab(tab);
        if (tab === 'time-exchange') { fetchMyTravel(); fetchTERequests(); }
        if (tab === 'my-bookings') fetchBookings();
        if (tab === 'my-schedule') fetchMyProfile();
        window.history.pushState(null, '', `#${tab}`);
    }; // 'welcome', 'find-jobs', 'my-jobs', 'my-ratings'
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

    // --- State: Availability & Bookings ---
    const [availability, setAvailability] = useState(true);
    const [myBookings, setMyBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [scheduleForm, setScheduleForm] = useState({ start: '09:00', end: '17:00' });
    const [savingSchedule, setSavingSchedule] = useState(false);

    const fetchMyProfile = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/profile', { headers: { 'Authorization': `Bearer ${token}` } });
            const result = await res.json();
            if (result.success && result.data?.availability) {
                const parts = result.data.availability.split('-');
                if (parts.length === 2) {
                    setScheduleForm({ start: parts[0], end: parts[1] });
                }
            }
        } catch(e) {}
    };
    
    const saveSchedule = async (e) => {
        e.preventDefault();
        setSavingSchedule(true);
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ availability: `${scheduleForm.start}-${scheduleForm.end}` })
            });
            if (res.ok) {
                toast.success(language === 'ur' ? 'شیڈول محفوظ ہو گیا' : 'Schedule saved!');
            }
        } catch (err) { toast.error('Error saving schedule'); }
        finally { setSavingSchedule(false); }
    };

    const fetchBookings = async () => {
        setLoadingBookings(true);
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/bookings/worker', { headers: { 'Authorization': `Bearer ${token}` } });
            const result = await res.json();
            if (result.success) setMyBookings(result.data);
        } catch (err) { console.error('Error fetching bookings:', err); }
        finally { setLoadingBookings(false); }
    };

    const handleBookingStatus = async (id, status) => {
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/bookings/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            const result = await res.json();
            if (result.success) {
                toast.success(`Booking ${status.toLowerCase()}`);
                setMyBookings(myBookings.map(b => b.id === id ? { ...b, status } : b));
            }
        } catch (err) { toast.error('Error updating status'); }
    };
    // International Jobs State
    const [intlJobs, setIntlJobs] = useState([]);
    const [filteredIntlJobs, setFilteredIntlJobs] = useState([]);
    const [loadingIntlJobs, setLoadingIntlJobs] = useState(false);
    const [intlSearchTerm, setIntlSearchTerm] = useState('');

    const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [savingAvailability, setSavingAvailability] = useState(false);

    // --- State: Modals ---
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingData, setRatingData] = useState({ rating: 5, comment: '', app: null });

    // --- State: Support Modal ---
    const [showComplaintModal, setShowComplaintModal] = useState(false);
    const [travelAnnouncements, setTravelAnnouncements] = useState([]);
    const [networkingTravelers, setNetworkingTravelers] = useState([]);
    const [teRequests, setTERequests] = useState([]);
    const [loadingTERequests, setLoadingTERequests] = useState(false);
    const [loadingTE, setLoadingTE] = useState(false);

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
    const [travelForm, setTravelForm] = useState({
        from_city: '',
        to_city: '',
        travel_date_start: '',
        travel_date_end: '',
        available_for_work: true,
        skills: user?.skills || ''
    });

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
    const fetchIntlJobs = useCallback(async () => {
        setLoadingIntlJobs(true);
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/international-jobs?type=blue', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setIntlJobs(data.data);
                setFilteredIntlJobs(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch international jobs:', error);
        } finally {
            setLoadingIntlJobs(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'international-jobs') {
            fetchIntlJobs();
        }
    }, [activeTab, fetchIntlJobs]);

    useEffect(() => {
        let result = intlJobs;
        if (intlSearchTerm) {
            result = result.filter(job => job.title.toLowerCase().includes(intlSearchTerm.toLowerCase()));
        }
        setFilteredIntlJobs(result);
    }, [intlSearchTerm, intlJobs]);

    const handleApplyIntlJob = async (jobId) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/international-jobs/${jobId}/apply`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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

    const fetchJobs = useCallback(async (overrideSearchTerm) => {
        const termToUse = typeof overrideSearchTerm === 'string' ? overrideSearchTerm : searchTerm;
        setLoadingJobs(true);
        setIsSearchingAI(!!termToUse);
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
                
                let blueJobs = data.filter(j => j.type === 'blue');
                
                // AI Skill Matching Engine
                const userKeywords = [];
                if (user?.profile) {
                    if (user.profile.trade) userKeywords.push(...user.profile.trade.toLowerCase().split(/[\s,]+/));
                    if (user.profile.skills) {
                        try {
                            const parsedSkills = JSON.parse(user.profile.skills);
                            if (Array.isArray(parsedSkills)) userKeywords.push(...parsedSkills.map(s => s.toLowerCase()));
                        } catch(e) {
                            if (typeof user.profile.skills === 'string') userKeywords.push(...user.profile.skills.toLowerCase().split(/[\s,]+/));
                        }
                    }
                    if (user.profile.bio) userKeywords.push(...user.profile.bio.toLowerCase().split(/[\s,]+/));
                }
                
                if (userKeywords.length > 0) {
                    blueJobs = blueJobs.map(job => {
                        let score = 0;
                        const jobText = `${job.title} ${job.titleUrdu || ''} ${job.description || ''} ${job.category || ''}`.toLowerCase();
                        
                        // Check for direct trade match (highest weight)
                        if (user.profile?.trade && jobText.includes(user.profile.trade.toLowerCase())) {
                            score += 50;
                        }
                        
                        // Check keyword overlap
                        
                        userKeywords.forEach(kw => {
                            if (kw.length > 2 && jobText.includes(kw)) {
                                
                                score += 15;
                            }
                        });
                        
                        // Cap at 98% for realism
                        let finalScore = Math.min(98, score > 0 ? score + 30 : 0); 
                        return { ...job, matchScore: finalScore };
                    });
                    
                    // Sort by match score descending
                    blueJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
                }

                setJobs(blueJobs);
                setFilteredJobs(blueJobs);

// eslint-disable-next-line react-hooks/exhaustive-deps

            }
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoadingJobs(false);
            setIsSearchingAI(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                
                // Fetch Bookings first to cross-reference
                let bookings = [];
                try {
                    const bRes = await fetch('http://localhost:5000/api/bookings/worker', { headers: { 'Authorization': `Bearer ${token}` } });
                    if (bRes.ok) {
                        const bData = await bRes.json();
                        if (bData.success) bookings = bData.data;
                    }
                } catch(e) {}

                const response = await fetch('http://localhost:5000/api/jobs/applications/my-applications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    
                    // Filter out Rejected apps and apps tied to Deleted jobs
                    const filteredApps = data.filter(app => {
                        if (app.status === 'Rejected') return false;
                        if ((!app.jobs || app.jobs.status === 'Deleted') && app.status !== 'Completed') return false;
                        return true;
                    });
                    
                    // Attach booking info
                    const enrichedApps = filteredApps.map(app => {
                        const linkedBooking = bookings.find(b => b.employer_id === app.jobs?.employer_id && b.title === app.jobs?.title);
                        return { ...app, linkedBooking };
                    });
                    
                    setMyApps(enrichedApps);
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
        handleTabChange('find-jobs');
    }, [fetchJobs]);

    return (
        <div className="wc-dashboard-container" dir={language === 'ur' ? 'rtl' : 'ltr'}>
            {/* Top Navigation Bar */}
            <nav className="wc-navbar">
                <div 
                    className="wc-nav-brand" 
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                    onClick={() => handleTabChange('welcome')}
                    title="JobNova Dashboard"
                >
                    <div style={{ background: 'var(--primary)', padding: '6px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                        </svg>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.5px', color: '#1e293b' }}>
                        JobNova <span style={{ color: 'var(--primary)' }}>Hunarmand</span>
                    </span>
                </div>
                <div className="wc-user-menu" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '5px', marginRight: '5px' }}>
                        <button className="wc-nav-link" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => navigate('/about')}>About Us</button>
                        <button className="wc-nav-link" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => navigate('/contact')}>Contact Us</button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <NotificationBell language={language} />
                        <div 
                            onClick={() => navigate('/profile')}
                            style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '50%', 
                                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                border: '2px solid white',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                overflow: 'hidden'
                            }}
                            title="Go to My Profile"
                        >
                            {user?.profile_picture ? (
                                <img src={user.profile_picture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                getDisplayName().charAt(0).toUpperCase()
                            )}
                        </div>
                        <span className="wc-user-greeting" style={{ fontWeight: 600 }}>{getDisplayName()}</span>
                        <button onClick={logout} className="btn btn-outline-light btn-sm" style={{ padding: '0.4rem 1rem', borderRadius: '8px' }}>{t('nav_logout')}</button>
                    </div>
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

                {/* -------------------- WELCOME TAB -------------------- */}
                {activeTab === 'welcome' && (
                    <section className="wc-welcome-section">
                        <div className="wc-welcome-hero">
                            <h1>{t('welcome_title')}, {getDisplayName()}! 👋</h1>
                            <p>{t('welcome_subtitle')}</p>
                        </div>
                        <div className="wc-dashboard-grid">
                            <div className="wc-dash-card" onClick={() => handleTabChange('find-jobs')} style={{ border: '2px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', background: 'var(--primary)', opacity: 0.1, borderRadius: '50%' }}></div>
                                <div className="wc-dash-card-icon" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                        <path d="M12 8v4"></path>
                                        <path d="M12 16h.01"></path>
                                    </svg>
                                </div>
                                <h3 style={{ color: 'var(--primary)', fontWeight: 700 }}>{language === 'ur' ? 'ہنرمند (Hunarmand)' : 'Hunarmand (AI Match)'}</h3>
                                <p style={{ fontWeight: 500 }}>{language === 'ur' ? 'اپنی مہارت کے مطابق نوکریاں تلاش کریں' : 'AI automatically finds jobs matched to your skills'}</p>
                            </div>
                            <div className="wc-dash-card" onClick={() => handleTabChange('my-jobs')}>
                                <div className="wc-dash-card-icon">📋</div>
                                <h3>{t('card_my_jobs')}</h3>
                                <p>{t('card_my_jobs_desc')}</p>
                            </div>
                            <div className="wc-dash-card" onClick={() => handleTabChange('my-ratings')}>
                                <div className="wc-dash-card-icon">⭐</div>
                                <h3>{t('card_my_ratings')}</h3>
                                <p>{t('card_my_ratings_desc')}</p>
                            </div>
                            <div className="wc-dash-card" onClick={() => handleTabChange('my-schedule')}>
                                <div className="wc-dash-card-icon">📅</div>
                                <h3>{t('card_schedule')}</h3>
                                <p>{t('card_schedule_desc')}</p>
                            </div>
                            <div className="wc-dash-card" onClick={() => handleTabChange('international-jobs')}>
                                <div className="wc-dash-card-icon">🌍</div>
                                <h3>{t('card_international')}</h3>
                                <p>{t('card_international_desc')}</p>
                            </div>
                            <div className="wc-dash-card" onClick={() => handleTabChange('time-exchange')}>
                                <div className="wc-dash-card-icon">✈️</div>
                                <h3>{t('card_time_exchange')}</h3>
                                <p>{language === 'ur' ? 'دیگر شہروں میں سفر اور کام کریں' : 'Travel and work in other cities'}</p>
                            </div>
                            <div className="wc-dash-card" onClick={() => handleTabChange('my-bookings')}>
                                <div className="wc-dash-card-icon">📅</div>
                                <h3>{t('card_bookings')}</h3>
                                <p>{t('card_bookings_desc')}</p>
                            </div>
                        </div>
                    </section>
                )}

                 {/* --- My Schedule Tab --- */}
                {activeTab === 'my-schedule' && (
                    <section className="wc-welcome-section">
                        <div className="wc-welcome-hero" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                            <h1>{t('schedule_header')} ⏱️</h1>
                            <p>{t('schedule_subtitle')}</p>
                        </div>
                        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', background: '#fff', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <form onSubmit={saveSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px', color: '#334155' }}>{t('schedule_start')}</label>
                                        <input type="time" required value={scheduleForm.start} onChange={e => setScheduleForm({...scheduleForm, start: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px', color: '#334155' }}>{t('schedule_end')}</label>
                                        <input type="time" required value={scheduleForm.end} onChange={e => setScheduleForm({...scheduleForm, end: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
                                    </div>
                                </div>
                                <button type="submit" disabled={savingSchedule} className="btn btn-primary" style={{ padding: '14px', borderRadius: '12px', fontSize: '1.05rem', fontWeight: 700 }}>
                                    {savingSchedule ? '...' : t('btn_save_schedule')}
                                </button>
                            </form>
                        </div>
                    </section>
                )}

                {/* --- My Bookings Tab --- */}
                {activeTab === 'my-bookings' && (
                    <section className="wc-welcome-section">
                        <div className="wc-welcome-hero" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
                            <h1>{language === 'ur' ? 'میری بکنگز' : 'My Bookings'} 📅</h1>
                            <p>{language === 'ur' ? 'اپنے شیڈول شدہ کاموں کا نظم کریں' : 'Manage your scheduled jobs'}</p>
                        </div>
                        
                        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
                            {loadingBookings ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading bookings...</div>
                            ) : myBookings.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '16px', color: '#64748b', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                    <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</p>
                                    <p>{language === 'ur' ? 'ابھی تک کوئی بکنگ نہیں۔' : 'No bookings yet.'}</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {myBookings.map(b => (
                                        <div key={b.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                            <div style={{ flex: 1, minWidth: '250px' }}>
                                                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: '#1e293b', fontWeight: 800 }}>{b.title}</h3>
                                                <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.95rem' }}>{language === 'ur' ? 'آجر' : 'Employer'}: <strong>{b.employer?.full_name || b.employer?.first_name || 'Employer'}</strong></p>
                                                <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', color: '#475569', flexWrap: 'wrap', background: '#f8fafc', padding: '10px', borderRadius: '10px' }}>
                                                    <span>📅 {new Date(b.booking_date).toLocaleDateString()}</span>
                                                    <span>⏰ {b.start_time?.slice(0,5)} - {b.end_time?.slice(0,5)}</span>
                                                    {b.location && <span>📍 {b.location}</span>}
                                                    {b.offered_rate && <span>💰 {b.offered_rate}</span>}
                                                </div>
                                                {b.description && <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#64748b' }}>{b.description}</p>}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', minWidth: '140px' }}>
                                                <span style={{ padding: '6px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', width: '100%', background: b.status === 'Pending' ? '#fef3c7' : b.status === 'Accepted' ? '#d1fae5' : b.status === 'Completed' ? '#dbeafe' : b.status === 'Rejected' ? '#fee2e2' : '#f1f5f9', color: b.status === 'Pending' ? '#92400e' : b.status === 'Accepted' ? '#065f46' : b.status === 'Completed' ? '#1e40af' : b.status === 'Rejected' ? '#991b1b' : '#475569' }}>
                                                    {b.status === 'Pending' ? (language === 'ur' ? 'زیر التوا' : 'Pending') :
                                                     b.status === 'Accepted' ? (language === 'ur' ? 'قبول کر لیا' : 'Accepted') :
                                                     b.status === 'Completed' ? (language === 'ur' ? 'مکمل' : 'Completed') :
                                                     b.status === 'Rejected' ? (language === 'ur' ? 'مسترد شدہ' : 'Rejected') :
                                                     (language === 'ur' ? 'منسوخ' : 'Cancelled')}
                                                </span>
                                                {b.status === 'Pending' && (
                                                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                                        <button onClick={() => handleBookingStatus(b.id, 'Rejected')} className="btn" style={{ flex: 1, padding: '8px', borderRadius: '10px', background: '#fee2e2', color: '#ef4444', border: 'none', fontWeight: 700, fontSize: '0.8rem' }}>{language === 'ur' ? 'مسترد کریں' : 'Reject'}</button>
                                                        <button onClick={() => handleBookingStatus(b.id, 'Accepted')} className="btn" style={{ flex: 1, padding: '8px', borderRadius: '10px', background: '#10b981', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.8rem', boxShadow: '0 4px 10px rgba(16,185,129,0.3)' }}>{language === 'ur' ? 'قبول کریں' : 'Accept'}</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                               {/* --- Time Exchange Tab --- */}
                {activeTab === 'time-exchange' && (
                    <section className="wc-welcome-section">
                        <div className="wc-welcome-hero" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
                            <h1>{t('te_header')}</h1>
                            <p>{t('te_subtitle')}</p>
                        </div>

                        <div className="te-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                            {/* Left: Post Travel Form */}
                            <div className="bc-search-section" style={{ padding: '2rem', borderRadius: '24px', height: 'fit-content' }}>
                                <h2 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.5rem' }}>{t('te_announce_btn')}</h2>
                                <form onSubmit={handlePostTravel} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '5px', display: 'block' }}>{t('te_from_label')}</label>
                                        <input type="text" required placeholder="e.g. Karachi" value={travelForm.from_city} onChange={e => setTravelForm({...travelForm, from_city: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none' }} />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '5px', display: 'block' }}>{t('te_to_label')}</label>
                                        <input type="text" required placeholder="e.g. Lahore" value={travelForm.to_city} onChange={e => setTravelForm({...travelForm, to_city: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '5px', display: 'block' }}>{t('te_start_label')}</label>
                                            <input type="date" required value={travelForm.travel_date_start} onChange={e => setTravelForm({...travelForm, travel_date_start: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none' }} />
                                        </div>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '5px', display: 'block' }}>{t('te_end_label')}</label>
                                            <input type="date" required value={travelForm.travel_date_end} onChange={e => setTravelForm({...travelForm, travel_date_end: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none' }} />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
                                        <input type="checkbox" id="te_avail" checked={travelForm.available_for_work} onChange={e => setTravelForm({...travelForm, available_for_work: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                                        <label htmlFor="te_avail" style={{ color: '#fff', cursor: 'pointer' }}>{t('te_available_check')}</label>
                                    </div>
                                    <button type="submit" disabled={loadingTE} className="btn btn-primary" style={{ padding: '12px', fontWeight: 600 }}>
                                        {loadingTE ? t('btn_saving') : t('te_post_btn')}
                                    </button>
                                </form>
                            </div>

                            {/* Right: Lists */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                {/* My Announcements */}
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

                                {/* Networking View */}
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
                                                    <button onClick={() => navigate(`/profile/${trav.user_id}`)} className="btn btn-primary" style={{ width: '100%', marginTop: '10px', padding: '5px', fontSize: '0.8rem' }}>View Profile</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* -------------------- TIME EXCHANGE HIRE REQUESTS -------------------- */}
                        <div style={{ marginTop: '3rem', background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h2 style={{ fontSize: '1.8rem', color: '#f8fafc', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                💼 {language === 'ur' ? 'کام کی درخواستیں' : 'Work Hire Requests'} 
                                {teRequests.filter(r => r.status === 'Pending').length > 0 && (
                                    <span style={{ fontSize: '0.8rem', background: '#ef4444', color: 'white', padding: '4px 12px', borderRadius: '20px', fontWeight: 800 }}>
                                        {teRequests.filter(r => r.status === 'Pending').length} NEW
                                    </span>
                                )}
                            </h2>

                            {loadingTERequests ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <div className="loading-spinner"></div>
                                </div>
                            ) : teRequests.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                                    {teRequests.map(req => (
                                        <div key={req.id} style={{ background: 'linear-gradient(135deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.8) 100%)', padding: '2rem', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)', position: 'relative', overflow: 'hidden' }}>
                                            <div style={{ position: 'absolute', top: 0, right: 0, padding: '8px 16px', background: req.status === 'Pending' ? '#f59e0b' : req.status === 'Accepted' ? '#10b981' : '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 900, borderBottomLeftRadius: '20px', letterSpacing: '1px' }}>{req.status.toUpperCase()}</div>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
                                                <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'white', boxShadow: '0 10px 20px rgba(79,70,229,0.3)' }}>
                                                    {req.employer?.first_name?.charAt(0) || '🏢'}
                                                </div>
                                                <div>
                                                    <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.3rem', fontWeight: 800 }}>{req.employer?.first_name} {req.employer?.last_name}</h3>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>Potential Employer</p>
                                                        <button 
                                                            onClick={() => navigate(`/profile/${req.employer_id}`)}
                                                            style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.8rem', padding: 0, cursor: 'pointer', textAlign: 'left', fontWeight: 600, textDecoration: 'underline' }}
                                                        >
                                                            {language === 'ur' ? 'آجر کی پروفائل دیکھیں' : 'View Employer Profile'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '15px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#cbd5e1', fontSize: '1rem', fontWeight: 600 }}>
                                                    <span style={{ fontSize: '1.2rem' }}>📍</span> {req.travel?.from_city}
                                                    <span style={{ color: '#64748b' }}>➔</span>
                                                    <span style={{ fontSize: '1.2rem' }}>🎯</span> {req.travel?.to_city}
                                                </div>
                                            </div>

                                            <div style={{ position: 'relative', marginBottom: '2rem' }}>
                                                <div style={{ position: 'absolute', left: '-10px', top: '0', bottom: '0', width: '4px', background: '#4f46e5', borderRadius: '2px' }}></div>
                                                <p style={{ margin: 0, paddingLeft: '15px', color: '#e2e8f0', fontSize: '1rem', fontStyle: 'italic', lineHeight: '1.6' }}>
                                                    "{req.message || "I'm interested in hiring you for your travel period."}"
                                                </p>
                                            </div>

                                            {req.status === 'Pending' && (
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    <button 
                                                        onClick={() => handleTERequestStatus(req.id, 'Accepted')}
                                                        style={{ flex: 2, padding: '14px', borderRadius: '18px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(16,185,129,0.3)', transition: 'all 0.3s ease' }}
                                                    >
                                                        {language === 'ur' ? 'قبول کریں' : 'Accept Offer'}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleTERequestStatus(req.id, 'Rejected')}
                                                        style={{ flex: 1, padding: '14px', borderRadius: '18px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#f87171', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s ease' }}
                                                    >
                                                        {language === 'ur' ? 'مسترد' : 'Decline'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '30px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
                                    <h3 style={{ color: '#94a3b8', margin: 0 }}>
                                        {language === 'ur' ? 'ابھی تک کوئی درخواست نہیں ملی' : 'No hire requests yet.'}
                                    </h3>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '5px' }}>
                                        {language === 'ur' ? 'اپنی پروفائل مکمل رکھیں تاکہ آجر آپ سے رابطہ کریں' : 'Keep your travel profile updated to attract employers!'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                )}


                {/* --- My Schedule Tab --- */}
                {activeTab === 'my-schedule' && (
                    <section className="wc-welcome-section">
                        <div className="wc-welcome-hero">
                            <h1>{t('card_schedule')} 📅</h1>
                            <p>{t('card_schedule_desc')}</p>
                        </div>
                        <section className="bc-search-section" style={{ padding: '3rem 2rem', borderRadius: '24px', maxWidth: '550px', margin: '0 auto' }}>
                            <div className="bc-glass-card" style={{ textAlign: language === 'ur' ? 'right' : 'left' }}>
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
                        </section>
                    </section>
                )}

                {/* --- Find Jobs Tab --- */}
                {activeTab === 'find-jobs' && (
                    <section className="wc-job-results">
                        <div className="wc-results-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <h2>{language === 'ur' ? 'ہنرمند (آپ کے لیے تجاویز)' : 'Hunarmand (AI Recommendations)'}</h2>

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
                                                
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <h3 style={{ fontSize: '1.4rem', color: '#4f46e5', margin: 0 }}>{language === 'ur' && job.titleUrdu ? job.titleUrdu : job.title}</h3>
                                                    {job.matchScore && job.matchScore > 50 && (
                                                        <span style={{ background: '#ecfdf5', color: '#10b981', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #a7f3d0' }}>
                                                            🎯 {job.matchScore}% Match
                                                        </span>
                                                    )}
                                                </div>
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
                                            <div className="wc-job-actions" style={{ display: 'flex', gap: '8px' }}>
                                                <button className="btn" onClick={() => navigate('/profile/' + job.employer_id)} style={{ padding: '0.75rem 1.2rem', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                                                    👤 {language === 'ur' ? 'پروفائل' : 'View Profile'}
                                                </button>
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
                                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => handleTabChange('find-jobs')}>{t('btn_browse_jobs')}</button>
                            </div>
                        ) : (
                            <div className="wc-job-list">
                                {myApps.map(app => (
                                    <div key={app.id} className="wc-job-card" style={{ borderLeft: app.status === 'Completed' ? '5px solid #10b981' : app.status === 'In Progress' ? '5px solid #3b82f6' : '5px solid #cbd5e1' }}>
                                        <div className="wc-job-main">
                                            <div className="wc-job-info">
                                                <h3 style={{ fontSize: '1.2rem', color: '#1e293b' }}>{language === 'ur' && app.jobs?.titleUrdu ? app.jobs?.titleUrdu : (app.jobs?.title || t('unknown_job'))}</h3>
                                                {app.jobs?.employer_id && (
                                                    <div style={{ marginBottom: '6px', marginTop: '4px' }}>
                                                        <button onClick={() => navigate('/profile/' + app.jobs.employer_id)} style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', padding: 0 }}>
                                                            <span style={{ background: '#e0e7ff', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>👤</span>
                                                            {language === 'ur' ? 'آجر کی پروفائل دیکھیں' : 'View Employer Profile'}
                                                        </button>
                                                    </div>
                                                )}
                                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                                    {app.jobs?.location} • {app.jobs?.hourly_rate || app.jobs?.salary_range}
                                                    {app.jobs?.duration && ` • ⏳ ${app.jobs.duration}`}
                                                </p>
                                                {app.linkedBooking && (
                                                    <div style={{ marginTop: '8px', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', color: '#475569', display: 'inline-flex', gap: '15px', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                                                        <span>📅 <strong>{new Date(app.linkedBooking.booking_date).toLocaleDateString()}</strong></span>
                                                        <span>⏰ <strong>{app.linkedBooking.start_time?.slice(0,5)} - {app.linkedBooking.end_time?.slice(0,5)}</strong></span>
                                                    </div>
                                                )}
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
                {/* -------------------- INTERNATIONAL JOBS TAB -------------------- */}
                {activeTab === 'international-jobs' && (
                    <section className="bc-search-section" style={{ padding: '1rem' }}>
                        {/* Premium Hero Banner */}
                        <div style={{ 
                            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
                            padding: '4rem 2rem',
                            borderRadius: '30px',
                            marginBottom: '2.5rem',
                            position: 'relative',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                            textAlign: 'center'
                        }}>
                            {/* Decorative Elements */}
                            <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
                            <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', filter: 'blur(50px)' }}></div>
                            
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <span style={{ fontSize: '2.5rem' }}>🌍</span>
                                </div>
                                <h1 style={{ 
                                    fontSize: '3rem', 
                                    fontWeight: 800, 
                                    marginBottom: '1rem', 
                                    letterSpacing: '-1px',
                                    background: 'linear-gradient(to right, #fff, #94a3b8)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    {language === 'ur' ? 'بیرونی روزگار کے مواقع' : 'Global Career Pathways'}
                                </h1>
                                <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                                    {language === 'ur' ? 'دنیا بھر میں بہترین تنخواہوں اور ویزا سپانسرشپ والی نوکریاں تلاش کریں' : 'Connect with high-paying international employers offering visa sponsorship and relocation support'}
                                </p>

                                {/* Modern Search Bar */}
                                <div style={{ 
                                    maxWidth: '800px', 
                                    margin: '0 auto',
                                    display: 'flex',
                                    gap: '10px',
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '10px',
                                    borderRadius: '20px',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                }}>
                                    <div style={{ flex: 1, position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                                        <input
                                            type="text"
                                            placeholder={language === 'ur' ? 'پیشہ یا ملک تلاش کریں...' : 'Search by job title or country...'}
                                            value={intlSearchTerm}
                                            onChange={(e) => setIntlSearchTerm(e.target.value)}
                                            style={{ 
                                                width: '100%', 
                                                padding: '14px 14px 14px 45px', 
                                                borderRadius: '14px', 
                                                border: 'none', 
                                                background: 'rgba(0,0,0,0.2)', 
                                                color: 'white',
                                                fontSize: '1rem',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                    <button className="btn btn-primary" style={{ padding: '0 2rem', borderRadius: '14px', fontWeight: 600 }}>
                                        {language === 'ur' ? 'تلاش کریں' : 'Search'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Results Grid */}
                        <div className="bc-jobs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                            {loadingIntlJobs ? (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem' }}>
                                    <div className="loading-spinner" style={{ width: '50px', height: '50px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
                                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>{language === 'ur' ? 'نوکریاں تلاش کی جا رہی ہیں...' : 'Scouting international opportunities...'}</p>
                                </div>
                            ) : filteredIntlJobs.length > 0 ? (
                                filteredIntlJobs.map(job => (
                                    <div key={job.id} className="bc-job-card" style={{ 
                                        background: 'linear-gradient(145deg, rgba(30,41,59,0.7), rgba(15,23,42,0.8))',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '24px',
                                        padding: '1.8rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1.2rem',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = 'rgba(79,70,229,0.4)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)'; }}
                                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)'; }}>
                                        
                                        {/* Top Accent Line */}
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #4f46e5, #10b981)' }}></div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h3 style={{ margin: '0 0 5px 0', color: '#f8fafc', fontSize: '1.3rem', fontWeight: 700 }}>{job.title}</h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                                                    
                                                    <span 
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/profile/${job.employer_id}`); }}
                                                        style={{ cursor: 'pointer', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                        title="View Employer Profile"
                                                    >
                                                        🏢 {job.employer ? `${job.employer.first_name} ${job.employer.last_name}` : 'Verified Employer'}
                                                        <small style={{ opacity: 0.7, fontSize: '0.65rem' }}> (View Profile 👤)</small>
                                                    </span>
                                                </div>
                                            </div>
                                            {job.visa_sponsored && (
                                                <span style={{ 
                                                    background: 'rgba(16,185,129,0.15)', 
                                                    color: '#10b981', 
                                                    padding: '6px 12px', 
                                                    borderRadius: '12px', 
                                                    fontSize: '0.75rem', 
                                                    fontWeight: 700,
                                                    border: '1px solid rgba(16,185,129,0.2)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    ✈️ {language === 'ur' ? 'ویزہ اسپانسر' : 'Visa Sponsored'}
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '12px', fontSize: '0.9rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                📍 {job.city ? `${job.city}, ` : ''}{job.country}
                                            </div>
                                            <div style={{ background: 'rgba(79,70,229,0.1)', padding: '8px 12px', borderRadius: '12px', fontSize: '0.9rem', color: '#818cf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                💰 {job.currency} {job.salary}
                                            </div>
                                        </div>

                                        <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.6, margin: 0, flex: 1 }}>
                                            {job.description?.length > 120 ? job.description.substring(0, 120) + '...' : job.description}
                                        </p>

                                        <button 
                                            className="btn btn-primary" 
                                            style={{ 
                                                width: '100%', 
                                                padding: '14px', 
                                                borderRadius: '16px', 
                                                fontWeight: 700, 
                                                fontSize: '1rem',
                                                background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                                                boxShadow: '0 4px 15px rgba(79,70,229,0.3)',
                                                border: 'none'
                                            }} 
                                            onClick={() => handleApplyIntlJob(job.id)}
                                        >
                                            {language === 'ur' ? 'درخواست جمع کروائیں' : 'Apply Now'}
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div style={{ 
                                    gridColumn: '1 / -1', 
                                    textAlign: 'center', 
                                    padding: '5rem 2rem', 
                                    background: 'rgba(255,255,255,0.02)', 
                                    borderRadius: '30px',
                                    border: '1px dashed rgba(255,255,255,0.1)'
                                }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🛸</div>
                                    <h3 style={{ fontSize: '1.5rem', color: '#e2e8f0', marginBottom: '0.5rem' }}>{language === 'ur' ? 'کوئی نوکری نہیں ملی' : 'No Global Openings Found'}</h3>
                                    <p style={{ color: '#64748b' }}>{language === 'ur' ? 'براہ کرم دوبارہ کوشش کریں یا اپنی تلاش کے الفاظ تبدیل کریں' : 'Check back soon! New international roles are posted daily.'}</p>
                                </div>
                            )}
                        </div>
                    </section>
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
