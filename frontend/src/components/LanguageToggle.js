import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './LanguageToggle.css';

const LanguageToggle = () => {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button 
            className="language-toggle-btn" 
            onClick={toggleLanguage}
            title={language === 'en' ? "Switch to Urdu" : "Switch to English"}
        >
            <span className={language === 'en' ? 'active' : ''}>EN</span>
            <span className="divider">|</span>
            <span className={language === 'ur' ? 'active' : ''}>اردو</span>
        </button>
    );
};

export default LanguageToggle;
