import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../index.css';

const Login = () => {
    const [formData, setFormData] = useState({
        identifier: '', // Can be email or phone
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!formData.identifier || !formData.password) {
                throw new Error('Please fill all fields');
            }

            await login(formData.identifier, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setError(typeof err === 'string' ? err : err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Login with your User ID or phone number</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>User ID or Phone Number</label>
                        <input
                            type="text"
                            name="identifier"
                            placeholder="User ID or 0300..."
                            value={formData.identifier}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary)' }}>Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
