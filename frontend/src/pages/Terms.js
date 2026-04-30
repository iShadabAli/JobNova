import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PublicPages.css';

const Terms = () => {
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
                    <h1 className="public-title">Terms of Service</h1>
                    <p className="public-subtitle">Effective Date: May 2026</p>

                    <div className="about-section">
                        <h2>1. Acceptance of Terms</h2>
                        <p>By accessing or using JobNova, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our services.</p>
                    </div>

                    <div className="about-section">
                        <h2>2. User Accounts</h2>
                        <p>You must provide accurate and complete information when creating an account. You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.</p>
                    </div>

                    <div className="about-section">
                        <h2>3. Platform Rules</h2>
                        <p>JobNova is a platform for job seeking and hiring. Users must not post false, misleading, or discriminatory job listings. Workers must provide truthful representations of their skills and experience.</p>
                    </div>

                    <div className="about-section">
                        <h2>4. Limitation of Liability</h2>
                        <p>JobNova acts as a venue for employers to post job opportunities and candidates to post resumes. We are not involved in the actual transaction between employers and candidates and are not responsible for user content.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Terms;
