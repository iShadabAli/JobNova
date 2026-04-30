import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';
import './Home.css';

const Home = () => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState('');
    const [activeJobTab, setActiveJobTab] = useState('all');
    const [fetchedJobs, setFetchedJobs] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const searchResultsRef = useRef(null);

    const isUrdu = language === 'ur';

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim() && !location.trim()) return;

        setIsSearching(true);
        setHasSearched(true);
        try {
            const response = await axios.get('http://localhost:5000/api/jobs/public');
            if (response.data && Array.isArray(response.data)) {
                let results = response.data;

                // Filter by search query (title, skills, description)
                if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    results = results.filter(job =>
                        (job.title && job.title.toLowerCase().includes(q)) ||
                        (job.skills && job.skills.toLowerCase().includes(q)) ||
                        (job.description && job.description.toLowerCase().includes(q)) ||
                        (job.profiles?.company_name && job.profiles.company_name.toLowerCase().includes(q))
                    );
                }

                // Filter by location
                if (location.trim()) {
                    const loc = location.toLowerCase();
                    results = results.filter(job =>
                        job.location && job.location.toLowerCase().includes(loc)
                    );
                }

                setSearchResults(results);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        }
        setIsSearching(false);

        // Auto-scroll down to the results
        setTimeout(() => {
            searchResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const clearSearch = () => {
        setSearchResults([]);
        setHasSearched(false);
        setSearchQuery('');
        setLocation('');
    };

    const categories = [
        { id: 1, name: "Information Technology", icon: "💻", count: "1,200+ Jobs" },
        { id: 2, name: "Sales & Marketing", icon: "📈", count: "850+ Jobs" },
        { id: 3, name: "Banking & Finance", icon: "🏦", count: "400+ Jobs" },
        { id: 4, name: "Healthcare", icon: "🏥", count: "600+ Jobs" },
        { id: 5, name: "Engineering", icon: "⚙️", count: "550+ Jobs" },
        { id: 6, name: "Blue-Collar Services", icon: "🛠️", count: "2,000+ Jobs" },
    ];

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                // Fetch public jobs directly from the new backend route
                const response = await axios.get('http://localhost:5000/api/jobs/public');
                if (response.data && Array.isArray(response.data)) {
                    setFetchedJobs(response.data);
                }
            } catch (error) {
                console.error("Error fetching public jobs:", error);
            }
        };
        fetchJobs();
    }, []);

    const getFilteredJobs = () => {
        if (fetchedJobs.length === 0) return [];
        
        switch (activeJobTab) {
            case 'it':
                return fetchedJobs.filter(j => j.type === 'white' && /developer|engineer|tech|design|ui|ux/i.test(j.title)).slice(0, 10);
            case 'marketing':
                return fetchedJobs.filter(j => j.type === 'white' && /market|seo|social|content|sales/i.test(j.title)).slice(0, 10);
            case 'blueCollar':
                return fetchedJobs.filter(j => j.type === 'blue').slice(0, 10);
            case 'all':
            default:
                return fetchedJobs.slice(0, 10); // Show the 10 most recent overall
        }
    };

    const topEmployers = [
        "TechNova", "Global Reach", "Apex Capital", "QuickFix", "BuildRight", "HealthPlus", "DataSync", "NextGen", "SmartWorks", "Pioneer"
    ];

    return (
        <div className={`home-container ${isUrdu ? 'rtl' : 'ltr'}`}>
            {/* Dark Hero Section */}
            <div className="hero-wrapper">
                <nav className="home-navbar">
                    <div className="logo-container">
                        <h1 className="logo">JobNova</h1>
                    </div>
                    <div className="nav-actions">
                        <LanguageToggle />
                        <button className="nav-login-btn" onClick={() => navigate('/login')}>{t('login', 'Login')}</button>
                        <button className="nav-register-btn" onClick={() => navigate('/register')}>{t('register', 'Register')}</button>
                    </div>
                </nav>

                <header className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-title">{t('heroTitle') || "Find Your Dream Job Today"}</h1>
                        <p className="hero-subtitle">{t('heroSubtitle') || "Connecting top talent with the best employers across Pakistan."}</p>
                        
                        <form className="hero-search-box" onSubmit={handleSearch}>
                            <div className="search-input-group">
                                <span className="search-icon">🔍</span>
                                <input 
                                    type="text" 
                                    placeholder={isUrdu ? "نوکری تلاش کریں..." : "Job Title, Skill or Company"} 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="divider"></div>
                            <div className="search-input-group">
                                <span className="search-icon">📍</span>
                                <input 
                                    type="text" 
                                    placeholder={isUrdu ? "شہر..." : "City or Location"} 
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn-primary search-btn">
                                {isUrdu ? "تلاش کریں" : "Search"}
                            </button>
                        </form>
                    </div>
                </header>
            </div>

            {/* Search Results Section */}
            {hasSearched && (
                <section className="search-results-section" ref={searchResultsRef}>
                    <div className="search-results-header">
                        <h2 className="dark-text">
                            {isSearching ? (isUrdu ? 'تلاش ہو رہی ہے...' : 'Searching...') : (
                                searchResults.length > 0
                                    ? `${searchResults.length} ${isUrdu ? 'نوکریاں ملیں' : 'Jobs Found'}`
                                    : (isUrdu ? 'کوئی نتائج نہیں ملے' : 'No Results Found')
                            )}
                        </h2>
                        <button className="clear-search-btn" onClick={clearSearch}>
                            {isUrdu ? '× صاف کریں' : '× Clear Search'}
                        </button>
                    </div>

                    {!isSearching && searchResults.length > 0 && (
                        <div className="search-results-grid">
                            {searchResults.map(job => (
                                <div key={job.id} className="job-card light-card">
                                    <div className="job-header">
                                        <h3 className="dark-text">{job.title}</h3>
                                        <span className="job-type">{job.type === 'white' ? 'White Collar' : 'Blue Collar'}</span>
                                    </div>
                                    <p className="job-company">{job.profiles?.company_name || job.profiles?.full_name || 'Verified Employer'}</p>
                                    <div className="job-details light-text">
                                        <span>📍 {job.location}</span>
                                        <span>💰 {job.salary_range || job.hourly_rate || 'Negotiable'}</span>
                                    </div>
                                    {job.skills && (
                                        <div className="job-skills">
                                            {job.skills.split(',').slice(0, 3).map((skill, i) => (
                                                <span key={i} className="skill-tag">{skill.trim()}</span>
                                            ))}
                                        </div>
                                    )}
                                    <button className="btn-outline apply-btn dark-btn-outline" onClick={() => navigate('/login')}>
                                        {isUrdu ? 'اپلائی کریں' : 'Apply Now'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isSearching && searchResults.length === 0 && (
                        <div className="no-results">
                            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</p>
                            <p className="dark-text" style={{ fontSize: '1.1rem' }}>
                                {isUrdu ? 'کوئی نوکری آپ کی تلاش سے مماثل نہیں ملی۔ مختلف الفاظ سے کوشش کریں۔' : 'No jobs matched your search. Try different keywords or location.'}
                            </p>
                        </div>
                    )}
                </section>
            )}

            {/* Light Body Content Starts Here */}
            <div className="light-body">
                
                {/* Categories Section */}
                <section className="categories-section">
                    <div className="section-header text-center">
                        <h2 className="dark-text">{isUrdu ? "صنعت کے لحاظ سے نوکریاں" : "Browse by Industry"}</h2>
                        <p className="light-text">{isUrdu ? "اپنے کیریئر کے لیے بہترین شعبہ منتخب کریں" : "Find jobs in your preferred sector"}</p>
                    </div>
                    <div className="categories-grid">
                        {categories.map(cat => (
                            <div key={cat.id} className="category-card light-card" onClick={() => navigate('/login')}>
                                <div className="category-icon">{cat.icon}</div>
                                <h3 className="dark-text">{cat.name}</h3>
                                <span className="category-count light-text">{cat.count}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Recent Jobs Tabbed Section */}
                <section className="featured-jobs-section bg-gray">
                    <div className="section-header text-center">
                        <h2 className="dark-text">{isUrdu ? "حالیہ نوکریاں" : "Recent Jobs"}</h2>
                    </div>
                    
                    <div className="tabs-container">
                        <div className="tabs-header">
                            <button className={`tab-btn ${activeJobTab === 'all' ? 'active' : ''}`} onClick={() => setActiveJobTab('all')}>
                                {isUrdu ? "تمام" : "All Jobs"}
                            </button>
                            <button className={`tab-btn ${activeJobTab === 'it' ? 'active' : ''}`} onClick={() => setActiveJobTab('it')}>
                                {isUrdu ? "آئی ٹی" : "IT & Tech"}
                            </button>
                            <button className={`tab-btn ${activeJobTab === 'marketing' ? 'active' : ''}`} onClick={() => setActiveJobTab('marketing')}>
                                {isUrdu ? "مارکیٹنگ" : "Marketing"}
                            </button>
                            <button className={`tab-btn ${activeJobTab === 'blueCollar' ? 'active' : ''}`} onClick={() => setActiveJobTab('blueCollar')}>
                                {isUrdu ? "بلیو کالر" : "Blue-Collar"}
                            </button>
                        </div>

                        <div className="jobs-marquee-wrapper">
                            <div className="jobs-grid">
                                {getFilteredJobs().length > 0 ? (
                                    [...getFilteredJobs(), ...getFilteredJobs()].map((job, index) => (
                                        <div key={`${job.id}-${index}`} className="job-card light-card">
                                            <div className="job-header">
                                                <h3 className="dark-text">{job.title}</h3>
                                                <span className="job-type">{job.type === 'white' ? 'White Collar' : 'Blue Collar'}</span>
                                            </div>
                                            <p className="job-company">{job.profiles?.company_name || job.profiles?.full_name || 'Verified Employer'}</p>
                                            <div className="job-details light-text">
                                                <span>📍 {job.location}</span>
                                                <span>💰 {job.salary_range || job.hourly_rate || 'Negotiable'}</span>
                                            </div>
                                            <button className="btn-outline apply-btn dark-btn-outline" onClick={() => navigate('/login')}>
                                                {isUrdu ? "اپلائی کریں" : "Apply Now"}
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center w-100" style={{ padding: '2rem', color: '#64748b' }}>
                                        {isUrdu ? "کوئی نوکریاں نہیں ملیں" : "No jobs posted in this category yet."}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="text-center" style={{ marginTop: '2rem' }}>
                            <button className="view-all-btn btn-primary" onClick={() => navigate('/login')}>
                                {isUrdu ? "تمام نوکریاں دیکھیں" : "View All Jobs"}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Top Employers Marquee */}
                <section className="employers-section">
                    <div className="section-header text-center">
                        <h2 className="dark-text">{isUrdu ? "ٹاپ ایمپلائرز" : "Trusted by Top Employers"}</h2>
                    </div>
                    <div className="marquee-container light-marquee">
                        <div className="marquee-content">
                            {[...topEmployers, ...topEmployers].map((employer, idx) => (
                                <div key={idx} className="employer-badge light-badge">
                                    {employer}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* App Download Banner */}
                <section className="app-download-banner">
                    <div className="app-banner-content">
                        <h2>{isUrdu ? "جاب نووا ایپ ڈاؤن لوڈ کریں" : "Get the JobNova App"}</h2>
                        <p>{isUrdu ? "کہیں بھی، کبھی بھی نوکری تلاش کریں" : "Find jobs on the go. Download our mobile app today!"}</p>
                        <div className="app-buttons">
                            <button className="store-btn google-play">Get it on Google Play</button>
                            <button className="store-btn app-store">Download on App Store</button>
                        </div>
                    </div>
                </section>

                {/* Simple Footer */}
                <footer className="home-footer dark-footer">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <h2>JobNova</h2>
                            <p>{isUrdu ? "پاکستان کا سب سے بڑا جاب پورٹل" : "Pakistan's premium job platform."}</p>
                        </div>
                        <div className="footer-links">
                            <a href="/about">About Us</a>
                            <a href="/contact">Contact</a>
                            <a href="/privacy">Privacy Policy</a>
                            <a href="/terms">Terms of Service</a>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; {new Date().getFullYear()} JobNova. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Home;
