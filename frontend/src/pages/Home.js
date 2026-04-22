import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageToggle from '../components/LanguageToggle';
import './Home.css';

const Home = () => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Dynamically apply RTL if Urdu is selected
    const isUrdu = language === 'ur';

    return (
        <div className={`home-container ${isUrdu ? 'rtl' : 'ltr'}`}>
            {/* Navbar Area */}
            <nav className="home-navbar">
                <div className="logo-container">
                    <h1 className="logo">JobNova</h1>
                </div>
                <div className="nav-actions">
                    <LanguageToggle />
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">{t('heroTitle')}</h1>
                    <p className="hero-subtitle">{t('heroSubtitle')}</p>
                    
                    <div className="hero-buttons">
                        <button className="btn-primary large" onClick={() => navigate('/login')}>
                            {t('findJobs')}
                        </button>
                        <button className="btn-outline large" onClick={() => navigate('/login')}>
                            {t('hireWorkers')}
                        </button>
                    </div>
                </div>
            </header>


        </div>
    );
};

export default Home;
