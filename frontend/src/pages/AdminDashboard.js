import React, { useState, useEffect } from 'react';
import '../index.css';

const AdminDashboard = ({ user, logout }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [logs, setLogs] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL;

    const getHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    });

    // ---- DATA FETCHING ----
    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/stats`, { headers: getHeaders() });
            const result = await res.json();
            if (result.success) setStats(result.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/users`, { headers: getHeaders() });
            const result = await res.json();
            if (result.success) setUsers(result.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const fetchJobs = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/jobs`, { headers: getHeaders() });
            const result = await res.json();
            if (result.success) setJobs(result.data);
        } catch (err) {
            console.error('Error fetching jobs:', err);
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/logs`, { headers: getHeaders() });
            const result = await res.json();
            if (result.success) setLogs(result.data);
        } catch (err) {
            console.error('Error fetching logs:', err);
        }
    };

    const fetchComplaints = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/complaints`, { headers: getHeaders() });
            const result = await res.json();
            if (result.success) setComplaints(result.data);
        } catch (err) {
            console.error('Error fetching complaints:', err);
        }
    };

    const fetchVerifications = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/verifications/pending`, { headers: getHeaders() });
            const result = await res.json();
            if (result.success) setVerifications(result.data);
        } catch (err) {
            console.error('Error fetching verifications:', err);
        }
    };

    // ---- COMPLAINT ACTION ----
    const handleUpdateComplaintStatus = async (id, status) => {
        const notes = prompt(`Enter admin notes for marking as ${status} (Optional):`);
        setActionLoading(id);
        try {
            const res = await fetch(`${API_URL}/admin/complaints/${id}/status`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ status, admin_notes: notes })
            });
            const result = await res.json();
            if (result.success) {
                setComplaints(prev => prev.map(c => c.id === id ? { ...c, status, admin_notes: notes } : c));
                fetchLogs();
            }
        } catch (err) {
            console.error('Error updating complaint:', err);
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            await Promise.all([fetchStats(), fetchUsers(), fetchJobs(), fetchLogs(), fetchComplaints(), fetchVerifications()]);
            setLoading(false);
        };
        loadAll();
    }, []);

    // ---- ACTIONS ----
    const handleToggleSuspend = async (userId) => {
        setActionLoading(userId);
        try {
            const res = await fetch(`${API_URL}/admin/users/${userId}/suspend`, {
                method: 'PUT',
                headers: getHeaders()
            });
            const result = await res.json();
            if (result.success) {
                setUsers(prev => prev.map(u =>
                    u.id === userId ? { ...u, is_suspended: !u.is_suspended } : u
                ));
                fetchLogs(); // refresh logs
                fetchStats(); // refresh stats
            }
        } catch (err) {
            console.error('Error toggling suspend:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleVerificationStatus = async (userId, status) => {
        setActionLoading(userId);
        try {
            const res = await fetch(`${API_URL}/admin/verifications/${userId}/status`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ status })
            });
            const result = await res.json();
            if (result.success) {
                setVerifications(prev => prev.filter(v => v.user_id !== userId));
                fetchLogs();
            }
        } catch (err) {
            console.error('Error updating verification:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;
        setActionLoading(jobId);
        try {
            const res = await fetch(`${API_URL}/admin/jobs/${jobId}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            const result = await res.json();
            if (result.success) {
                setJobs(prev => prev.filter(j => j.id !== jobId));
                fetchLogs();
                fetchStats();
            }
        } catch (err) {
            console.error('Error deleting job:', err);
        } finally {
            setActionLoading(null);
        }
    };

    // ---- HELPER ----
    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'employer': return '#8b5cf6';
            case 'blue_collar': return '#3b82f6';
            case 'white_collar': return '#10b981';
            case 'admin': return '#ef4444';
            default: return '#64748b';
        }
    };

    const filteredUsers = users.filter(u =>
        `${u.first_name} ${u.last_name} ${u.user_id} ${u.phone} ${u.role}`
            .toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredJobs = jobs.filter(j =>
        `${j.title} ${j.location} ${j.type} ${j.status}`
            .toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredComplaints = complaints.filter(c =>
        `${c.reason} ${c.status} ${c.reporter?.first_name} ${c.reported_user?.first_name}`
            .toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0f172a' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0' }}>
            {/* NAVBAR */}
            <nav style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 32px', background: '#1e293b', borderBottom: '1px solid #334155',
                position: 'sticky', top: 0, zIndex: 40
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                    <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc' }}>
                        Admin Dashboard
                    </h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        Hi, {user?.first_name || 'Admin'}
                    </span>
                    <button onClick={logout} style={{
                        padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none',
                        borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '0.85rem'
                    }}>
                        Logout
                    </button>
                </div>
            </nav>

            {/* TAB BAR */}
            <div style={{
                display: 'flex', gap: '0', background: '#1e293b', borderBottom: '1px solid #334155',
                padding: '0 32px', overflowX: 'auto'
            }}>
                {[
                    { key: 'overview', label: '📊 Overview', icon: '' },
                    { key: 'users', label: '👥 Users', icon: '' },
                    { key: 'jobs', label: '💼 Jobs', icon: '' },
                    { key: 'complaints', label: '⚠️ Complaints', icon: '' },
                    { key: 'verifications', label: '🛡️ Verifications', icon: '' },
                    { key: 'logs', label: '📜 Logs', icon: '' }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key); setSearchTerm(''); }}
                        style={{
                            padding: '14px 24px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab.key ? '3px solid #3b82f6' : '3px solid transparent',
                            color: activeTab === tab.key ? '#3b82f6' : '#94a3b8',
                            fontWeight: activeTab === tab.key ? '600' : '400',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTENT */}
            <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>

                {/* ======== OVERVIEW TAB ======== */}
                {activeTab === 'overview' && stats && (
                    <div>
                        {/* Stats Cards */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '20px', marginBottom: '32px'
                        }}>
                            {[
                                { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#3b82f6' },
                                { label: 'Total Jobs', value: stats.totalJobs, icon: '💼', color: '#8b5cf6' },
                                { label: 'Applications', value: stats.totalApplications, icon: '📋', color: '#10b981' },
                                { label: 'Reviews', value: stats.totalReviews, icon: '⭐', color: '#f59e0b' }
                            ].map((card, i) => (
                                <div key={i} style={{
                                    background: '#1e293b', borderRadius: '12px', padding: '24px',
                                    border: '1px solid #334155', transition: 'transform 0.2s',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>{card.label}</p>
                                            <h2 style={{ margin: '8px 0 0', fontSize: '2rem', fontWeight: '700', color: card.color }}>{card.value}</h2>
                                        </div>
                                        <span style={{ fontSize: '2.5rem' }}>{card.icon}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Role Distribution */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{
                                background: '#1e293b', borderRadius: '12px', padding: '24px',
                                border: '1px solid #334155'
                            }}>
                                <h3 style={{ margin: '0 0 16px', color: '#f8fafc' }}>User Distribution by Role</h3>
                                {Object.entries(stats.roleCounts).map(([role, count]) => (
                                    <div key={role} style={{ marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                                                {role.replace('_', ' ')}
                                            </span>
                                            <span style={{ color: '#f8fafc', fontWeight: '600' }}>{count}</span>
                                        </div>
                                        <div style={{ background: '#334155', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${stats.totalUsers > 0 ? (count / stats.totalUsers * 100) : 0}%`,
                                                height: '100%',
                                                background: getRoleBadgeColor(role),
                                                borderRadius: '4px',
                                                transition: 'width 0.5s ease'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{
                                background: '#1e293b', borderRadius: '12px', padding: '24px',
                                border: '1px solid #334155'
                            }}>
                                <h3 style={{ margin: '0 0 16px', color: '#f8fafc' }}>Job & Application Stats</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div style={{ textAlign: 'center', padding: '16px', background: '#0f172a', borderRadius: '8px' }}>
                                        <p style={{ margin: 0, color: '#10b981', fontSize: '1.5rem', fontWeight: '700' }}>{stats.activeJobs}</p>
                                        <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>Active Jobs</p>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '16px', background: '#0f172a', borderRadius: '8px' }}>
                                        <p style={{ margin: 0, color: '#ef4444', fontSize: '1.5rem', fontWeight: '700' }}>{stats.closedJobs}</p>
                                        <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>Closed Jobs</p>
                                    </div>
                                </div>
                                <h4 style={{ margin: '20px 0 12px', color: '#f8fafc', fontSize: '0.9rem' }}>Application Statuses</h4>
                                {Object.entries(stats.appStatusCounts || {}).map(([status, count]) => (
                                    <div key={status} style={{
                                        display: 'flex', justifyContent: 'space-between', padding: '6px 0',
                                        borderBottom: '1px solid #334155', fontSize: '0.85rem'
                                    }}>
                                        <span style={{ color: '#94a3b8' }}>{status}</span>
                                        <span style={{ color: '#f8fafc', fontWeight: '500' }}>{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ======== USERS TAB ======== */}
                {activeTab === 'users' && (
                    <div>
                        <div style={{ marginBottom: '20px' }}>
                            <input
                                type="text"
                                placeholder="Search users by name, ID, phone, or role..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%', maxWidth: '400px', padding: '10px 16px',
                                    background: '#1e293b', border: '1px solid #334155', borderRadius: '8px',
                                    color: '#e2e8f0', fontSize: '0.9rem', outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%', borderCollapse: 'collapse',
                                background: '#1e293b', borderRadius: '12px', overflow: 'hidden'
                            }}>
                                <thead>
                                    <tr style={{ background: '#334155' }}>
                                        {['Name', 'User ID', 'Phone', 'Role', 'Status', 'Joined', 'Action'].map(h => (
                                            <th key={h} style={{
                                                padding: '12px 16px', textAlign: 'left',
                                                color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600',
                                                textTransform: 'uppercase', letterSpacing: '0.5px'
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(u => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid #334155' }}>
                                            <td style={{ padding: '12px 16px', color: '#f8fafc', fontWeight: '500' }}>
                                                {u.first_name} {u.last_name}
                                            </td>
                                            <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>{u.user_id}</td>
                                            <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>{u.phone || '—'}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{
                                                    padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem',
                                                    fontWeight: '600', color: 'white',
                                                    background: getRoleBadgeColor(u.role),
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {u.role?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{
                                                    padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    color: u.is_suspended ? '#fca5a5' : '#86efac',
                                                    background: u.is_suspended ? '#450a0a' : '#052e16'
                                                }}>
                                                    {u.is_suspended ? '🚫 Suspended' : '✅ Active'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                {u.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleToggleSuspend(u.id)}
                                                        disabled={actionLoading === u.id}
                                                        style={{
                                                            padding: '6px 14px', border: 'none', borderRadius: '6px',
                                                            fontSize: '0.78rem', fontWeight: '500', cursor: 'pointer',
                                                            background: u.is_suspended ? '#16a34a' : '#dc2626',
                                                            color: 'white',
                                                            opacity: actionLoading === u.id ? 0.6 : 1
                                                        }}
                                                    >
                                                        {actionLoading === u.id ? '...' : u.is_suspended ? 'Unsuspend' : 'Suspend'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredUsers.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No users found.</p>
                        )}
                    </div>
                )}

                {/* ======== JOBS TAB ======== */}
                {activeTab === 'jobs' && (
                    <div>
                        <div style={{ marginBottom: '20px' }}>
                            <input
                                type="text"
                                placeholder="Search jobs by title, location, type, or status..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%', maxWidth: '400px', padding: '10px 16px',
                                    background: '#1e293b', border: '1px solid #334155', borderRadius: '8px',
                                    color: '#e2e8f0', fontSize: '0.9rem', outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%', borderCollapse: 'collapse',
                                background: '#1e293b', borderRadius: '12px', overflow: 'hidden'
                            }}>
                                <thead>
                                    <tr style={{ background: '#334155' }}>
                                        {['Title', 'Type', 'Location', 'Status', 'Applicants', 'Posted', 'Action'].map(h => (
                                            <th key={h} style={{
                                                padding: '12px 16px', textAlign: 'left',
                                                color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600',
                                                textTransform: 'uppercase', letterSpacing: '0.5px'
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredJobs.map(j => (
                                        <tr key={j.id} style={{ borderBottom: '1px solid #334155' }}>
                                            <td style={{ padding: '12px 16px', color: '#f8fafc', fontWeight: '500' }}>{j.title}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{
                                                    padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem',
                                                    fontWeight: '600', color: 'white',
                                                    background: j.type === 'blue' ? '#3b82f6' : '#8b5cf6',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {j.type === 'blue' ? 'Blue Collar' : 'White Collar'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>{j.location}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{
                                                    padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    color: j.status === 'Active' ? '#86efac' : '#fca5a5',
                                                    background: j.status === 'Active' ? '#052e16' : '#450a0a'
                                                }}>
                                                    {j.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>
                                                {j.applications?.[0]?.count || 0}
                                            </td>
                                            <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>
                                                {new Date(j.created_at).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <button
                                                    onClick={() => handleDeleteJob(j.id)}
                                                    disabled={actionLoading === j.id}
                                                    style={{
                                                        padding: '6px 14px', border: 'none', borderRadius: '6px',
                                                        fontSize: '0.78rem', fontWeight: '500', cursor: 'pointer',
                                                        background: '#dc2626', color: 'white',
                                                        opacity: actionLoading === j.id ? 0.6 : 1
                                                    }}
                                                >
                                                    {actionLoading === j.id ? '...' : '🗑 Delete'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredJobs.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No jobs found.</p>
                        )}
                    </div>
                )}

                {/* ======== COMPLAINTS TAB ======== */}
                {activeTab === 'complaints' && (
                    <div>
                        <div style={{ marginBottom: '20px' }}>
                            <input
                                type="text"
                                placeholder="Search complaints..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%', maxWidth: '400px', padding: '10px 16px',
                                    background: '#1e293b', border: '1px solid #334155', borderRadius: '8px',
                                    color: '#e2e8f0', fontSize: '0.9rem', outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%', borderCollapse: 'collapse',
                                background: '#1e293b', borderRadius: '12px', overflow: 'hidden'
                            }}>
                                <thead>
                                    <tr style={{ background: '#334155' }}>
                                        {['Date', 'Reporter', 'Reported Target', 'Reason', 'Status', 'Actions'].map(h => (
                                            <th key={h} style={{
                                                padding: '12px 16px', textAlign: 'left',
                                                color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600',
                                                textTransform: 'uppercase', letterSpacing: '0.5px'
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredComplaints.map(c => {
                                        let targetDisplay = 'General Issue';
                                        let targetId = null;
                                        if (c.reported_user) {
                                            targetDisplay = `User: ${c.reported_user.first_name} ${c.reported_user.last_name}`;
                                            targetId = c.reported_user.id;
                                        } else if (c.reported_job) {
                                            targetDisplay = `Job: ${c.reported_job.title}`;
                                        }

                                        return (
                                            <tr key={c.id} style={{ borderBottom: '1px solid #334155' }}>
                                                <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>
                                                    {new Date(c.created_at).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '12px 16px', color: '#f8fafc', fontWeight: '500' }}>
                                                    {c.reporter?.first_name} {c.reporter?.last_name}
                                                </td>
                                                <td style={{ padding: '12px 16px', color: '#fca5a5', fontWeight: '500' }}>
                                                    {targetDisplay}
                                                </td>
                                                <td style={{ padding: '12px 16px', maxWidth: '300px' }}>
                                                    <div style={{ color: '#f8fafc', fontWeight: '600', marginBottom: '4px' }}>
                                                        {c.reason.replace(/_/g, ' ').toUpperCase()}
                                                    </div>
                                                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', wordWrap: 'break-word' }}>
                                                        {c.description}
                                                    </div>
                                                    {c.admin_notes && (
                                                        <div style={{ marginTop: '8px', padding: '6px', background: '#0f172a', borderRadius: '4px', fontSize: '0.8rem', color: '#fbbf24', borderLeft: '3px solid #f59e0b' }}>
                                                            <strong>Admin Note:</strong> {c.admin_notes}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <span style={{
                                                        padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem',
                                                        fontWeight: '600', color: 'white',
                                                        background: c.status === 'pending' ? '#d97706' : c.status === 'resolved' ? '#16a34a' : '#475569',
                                                        textTransform: 'capitalize'
                                                    }}>
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                        {c.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleUpdateComplaintStatus(c.id, 'resolved')}
                                                                    disabled={actionLoading === c.id}
                                                                    style={{ padding: '6px 10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                                                >
                                                                    Resolve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateComplaintStatus(c.id, 'dismissed')}
                                                                    disabled={actionLoading === c.id}
                                                                    style={{ padding: '6px 10px', background: '#64748b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                                                >
                                                                    Dismiss
                                                                </button>
                                                            </>
                                                        )}
                                                        {c.reported_user && c.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleToggleSuspend(targetId)}
                                                                style={{ padding: '6px 10px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', opacity: actionLoading === targetId ? 0.6 : 1 }}
                                                            >
                                                                {actionLoading === targetId ? '...' : 'Suspend Target'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {filteredComplaints.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No complaints found.</p>
                        )}
                    </div>
                )}

                {/* ======== VERIFICATIONS TAB ======== */}
                {activeTab === 'verifications' && (
                    <div>
                        <h3 style={{ margin: '0 0 16px', color: '#f8fafc' }}>Pending ID Verifications</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%', borderCollapse: 'collapse',
                                background: '#1e293b', borderRadius: '12px', overflow: 'hidden'
                            }}>
                                <thead>
                                    <tr style={{ background: '#334155' }}>
                                        {['User', 'Role', 'Document', 'Actions'].map(h => (
                                            <th key={h} style={{
                                                padding: '12px 16px', textAlign: 'left',
                                                color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600',
                                                textTransform: 'uppercase', letterSpacing: '0.5px'
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {verifications.map(v => (
                                        <tr key={v.user_id} style={{ borderBottom: '1px solid #334155' }}>
                                            <td style={{ padding: '12px 16px', color: '#f8fafc', fontWeight: '500' }}>
                                                {v.full_name}
                                                <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>
                                                    {v.users?.phone || v.users?.email}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{
                                                    padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem',
                                                    fontWeight: '600', color: 'white',
                                                    background: getRoleBadgeColor(v.role),
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {v.role?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <a href={v.verification_document_url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
                                                    📄 View Document
                                                </a>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => handleVerificationStatus(v.user_id, 'verified')}
                                                        disabled={actionLoading === v.user_id}
                                                        style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                    >
                                                        {actionLoading === v.user_id ? '...' : 'Approve'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleVerificationStatus(v.user_id, 'rejected')}
                                                        disabled={actionLoading === v.user_id}
                                                        style={{ padding: '6px 12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                    >
                                                        {actionLoading === v.user_id ? '...' : 'Reject'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {verifications.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No pending verifications.</p>
                        )}
                    </div>
                )}

                {/* ======== LOGS TAB ======== */}
                {activeTab === 'logs' && (
                    <div>
                        <h3 style={{ margin: '0 0 16px', color: '#f8fafc' }}>System Activity Logs</h3>
                        {logs.length === 0 ? (
                            <div style={{
                                textAlign: 'center', padding: '3rem', color: '#64748b',
                                background: '#1e293b', borderRadius: '12px', border: '1px solid #334155'
                            }}>
                                <p style={{ fontSize: '2rem', margin: '0 0 8px' }}>📜</p>
                                <p>No system logs yet. Admin actions will appear here.</p>
                            </div>
                        ) : (
                            <div style={{
                                background: '#1e293b', borderRadius: '12px', border: '1px solid #334155',
                                overflow: 'hidden'
                            }}>
                                {logs.map((log, i) => (
                                    <div key={log.id} style={{
                                        padding: '16px 20px',
                                        borderBottom: i < logs.length - 1 ? '1px solid #334155' : 'none',
                                        display: 'flex', gap: '16px', alignItems: 'flex-start'
                                    }}>
                                        <span style={{
                                            fontSize: '1.2rem', marginTop: '2px',
                                            minWidth: '28px', textAlign: 'center'
                                        }}>
                                            {log.action === 'USER_SUSPENDED' ? '🚫' :
                                             log.action === 'USER_UNSUSPENDED' ? '✅' :
                                             log.action === 'JOB_DELETED' ? '🗑️' : '📋'}
                                        </span>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, color: '#f8fafc', fontWeight: '500', fontSize: '0.9rem' }}>
                                                {log.action.replace(/_/g, ' ')}
                                            </p>
                                            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                                                {log.details}
                                            </p>
                                        </div>
                                        <span style={{ color: '#64748b', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                            {new Date(log.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
