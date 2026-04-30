import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './PublicPages.css';

const Contact = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: user ? (user.full_name || user.first_name || '') : '',
        email: '',
        phone: user ? (user.phone || '') : '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:5000/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast.success('Your message has been sent successfully!');
                setFormData({ ...formData, message: '' }); // Clear message
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to send message.');
            }
        } catch (error) {
            console.error('Error submitting contact form:', error);
            toast.error('Network error. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    <h1 className="public-title">Contact Us</h1>
                    <p className="public-subtitle">Have a question or feedback? We'd love to hear from you.</p>

                    <form onSubmit={handleSubmit} className="contact-form">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label>Your Name *</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    className="contact-input" 
                                    required 
                                    placeholder="e.g., John Doe"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address *</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    className="contact-input" 
                                    required 
                                    placeholder="e.g., john@example.com"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Phone Number (Optional)</label>
                            <input 
                                type="text" 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleChange} 
                                className="contact-input" 
                                placeholder="e.g., +92 300 1234567"
                            />
                        </div>

                        <div className="form-group">
                            <label>Your Message *</label>
                            <textarea 
                                name="message" 
                                value={formData.message} 
                                onChange={handleChange} 
                                className="contact-textarea" 
                                required 
                                placeholder="How can we help you?"
                            ></textarea>
                        </div>

                        <button type="submit" className="btn-submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
