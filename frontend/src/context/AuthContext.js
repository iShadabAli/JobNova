import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(sessionStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.REACT_APP_API_URL;

    // Initialize Auth State
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const res = await axios.get(`${API_URL}/auth/profile`);
                    if (res.data.success) {
                        setUser(res.data.data);
                    } else {
                        logout();
                    }
                } catch (error) {
                    console.error('Auth Load Error:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        loadUser();
    }, [token, API_URL]);

    // Login: identifier (email or phone) + password
    const login = async (identifier, password) => {
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { identifier, password });
            if (res.data.success) {
                const { token, user } = res.data.data;
                sessionStorage.setItem('token', token);
                setToken(token);
                setUser(user);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Ensure header is set immediately
                return user;
            }
        } catch (error) {
            throw error.response?.data?.message || 'Login failed';
        }
    };

    // Register: user_id, phone, password, role, first_name, last_name
    const register = async (user_id, phone, password, role, first_name, last_name) => {
        try {
            const res = await axios.post(`${API_URL}/auth/register`, { user_id, phone, password, role, first_name, last_name });
            if (res.data.success) {
                const { token, user } = res.data.data;
                sessionStorage.setItem('token', token);
                setToken(token);
                setUser(user);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                return user;
            }
        } catch (error) {
            throw error.response?.data?.message || 'Registration failed';
        }
    };

    // Logout
    const logout = () => {
        sessionStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
