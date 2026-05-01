import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import BlueCollarDashboard from './pages/BlueCollarDashboard';
import WhiteCollarDashboard from './pages/WhiteCollarDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import { LanguageProvider } from './context/LanguageContext';
import './App.css';

// Profile Wrapper to pass auth props
const ProfileWrapper = () => {
    const { user, logout } = useAuth();
    return <Profile user={user} logout={logout} />;
};

// Dashboard Router
const Dashboard = () => {
    const { user, logout } = useAuth();

    if (!user) return <Navigate to="/login" />;

    if (user.role === 'blue_collar') {
        return <BlueCollarDashboard user={user} logout={logout} />;
    }

    if (user.role === 'white_collar') {
        return <WhiteCollarDashboard user={user} logout={logout} />;
    }

    if (user.role === 'employer') {
        return <EmployerDashboard user={user} logout={logout} />;
    }

    if (user.role === 'admin') {
        return <AdminDashboard user={user} logout={logout} />;
    }

    return (
        <div className="container" style={{ padding: '2rem' }}>
            <h1>{user.role} Dashboard</h1>
            <button onClick={logout} className="btn btn-secondary">Logout</button>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <LanguageProvider>
                <Router>
                    <div className="app">
                        <Toaster position="top-center" containerStyle={{ zIndex: 99999 }} />
                        <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <ProfileWrapper />
                            </ProtectedRoute>
                        } />

                        <Route path="/profile/:userId" element={
                            <ProtectedRoute>
                                <PublicProfile />
                            </ProtectedRoute>
                        } />

                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />

                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/" element={<Home />} />
                    </Routes>
                </div>
            </Router>
            </LanguageProvider>
        </AuthProvider>
    );
}

export default App;
