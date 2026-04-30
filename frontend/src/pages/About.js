import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PublicPages.css';

const About = () => {
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
                    <h1 className="public-title">About JobNova</h1>
                    <p className="public-subtitle">Bridging the gap between professional careers and skilled labor in Pakistan.</p>

                    <div className="about-section">
                        <h2>🚀 Our Mission</h2>
                        <p>JobNova was created to revolutionize the recruitment landscape by providing an inclusive platform that caters to both white-collar professionals and blue-collar skilled workers. We believe that finding the right job or the right worker should be seamless, transparent, and accessible to everyone.</p>
                    </div>

                    <div className="about-section">
                        <h2>💡 Why Choose Us?</h2>
                        <p>Unlike traditional job boards, JobNova offers a unified ecosystem. Whether you are an employer looking for a software engineer, or a homeowner needing an electrician, JobNova connects you with verified talent instantly.</p>
                    </div>

                    <div className="about-grid">
                        <div className="about-feature">
                            <div className="feature-icon">🌐</div>
                            <div className="feature-title">Dual Portals</div>
                            <div className="feature-desc">Dedicated experiences for White-Collar and Blue-Collar workers.</div>
                        </div>
                        <div className="about-feature">
                            <div className="feature-icon">🗣️</div>
                            <div className="feature-title">Inclusive Design</div>
                            <div className="feature-desc">Full Urdu support and Roman Urdu Voice Search for accessibility.</div>
                        </div>
                        <div className="about-feature">
                            <div className="feature-icon">🤖</div>
                            <div className="feature-title">AI Matching</div>
                            <div className="feature-desc">Smart algorithms connect the right skills to the right jobs.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
