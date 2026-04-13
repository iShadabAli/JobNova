import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../index.css';

const Register = () => {
    const [formData, setFormData] = useState({
        user_id: '',
        phone: '',
        password: '',
        role: '',
        first_name: '',
        last_name: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (role) => {
        setFormData({ ...formData, role });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!formData.user_id || !formData.phone || !formData.password || !formData.role || !formData.first_name || !formData.last_name) {
                throw new Error('Please fill all fields and select a role');
            }

            await register(formData.user_id, formData.phone, formData.password, formData.role, formData.first_name, formData.last_name);
            navigate('/dashboard');
        } catch (err) {
            setError(typeof err === 'string' ? err : err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { id: 'blue_collar', title: 'Blue Collar', icon: '🛠️' },
        { id: 'white_collar', title: 'White Collar', icon: '👔' },
        { id: 'employer', title: 'Employer', icon: '🤝' }
    ];

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: '500px' }}>
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Join JobNova today</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleRegister}>
                    <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label>First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                placeholder="First Name"
                                value={formData.first_name}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>
                        <div>
                            <label>Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                placeholder="Last Name"
                                value={formData.last_name}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>User ID</label>
                        <input
                            type="text"
                            name="user_id"
                            placeholder="Choose a User ID"
                            value={formData.user_id}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="0300 1234567"
                            value={formData.phone}
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
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Select Role</label>
                        <div className="role-grid-mini">
                            {roles.map((r) => (
                                <div
                                    key={r.id}
                                    className={`role-card-mini ${formData.role === r.id ? 'active' : ''}`}
                                    onClick={() => handleRoleSelect(r.id)}
                                >
                                    <span>{r.icon} {r.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <p style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
