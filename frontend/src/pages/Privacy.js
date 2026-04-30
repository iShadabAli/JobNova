import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PublicPages.css';

const Privacy = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleBack = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/');
        }
    };

    return (
        <div className="public-page-container">
            <nav className="public-navbar">
                <Link to={user ? "/dashboard" : "/"} className="public-logo">JobNova</Link>
                <button onClick={handleBack} className="public-back-btn">
                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>←</span> {user ? "Back to Dashboard" : "Back to Home"}
                </button>
            </nav>

            <div className="public-content">
                <div className="public-glass-card">
                    <h1 className="public-title">Privacy Policy</h1>
                    <p className="public-subtitle">Last updated: May 2026</p>

                    <div className="about-section">
                        <h2>1. Information We Collect</h2>
                        <p>We collect information you provide directly to us, such as your name, contact information, resume details, and professional experience when you register for an account, create a profile, or apply for jobs.</p>
                    </div>

                    <div className="about-section">
                        <h2>2. How We Use Your Information</h2>
                        <p>We use the information we collect to provide, maintain, and improve our services, to match job seekers with relevant opportunities, and to communicate with you about your account and job applications.</p>
                    </div>

                    <div className="about-section">
                        <h2>3. Information Sharing</h2>
                        <p>We share your profile information and job applications with potential employers when you apply for a job or make your profile public. We do not sell your personal data to third parties.</p>
                    </div>

                    <div className="about-section">
                        <h2>4. Data Security</h2>
                        <p>We implement robust security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. We use industry-standard encryption for sensitive data.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
