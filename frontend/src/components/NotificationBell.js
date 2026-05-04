import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import '../index.css';
import { BASE_URL } from '../utils/api';

const NotificationBell = ({ language = 'en' }) => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(null); // tracks which notification action is loading
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const t = ({
        en: {
            title: 'Notifications',
            empty: 'No new notifications',
            mark_all_read: 'Mark all as read',
            view_profile: 'View Profile',
            hire: 'Hire',
            reject: 'Reject',
            hired: 'Hired ✓',
            rejected: 'Rejected',
            error: 'Failed to load notifications'
        },
        ur: {
            title: 'نوٹیفیکیشنز',
            empty: 'کوئی نیا نوٹیفکیشن نہیں',
            mark_all_read: 'سب پڑھ لیے گئے',
            view_profile: 'پروفائل دیکھیں',
            hire: 'ملازمت دیں',
            reject: 'مسترد کریں',
            hired: 'ملازمت دی گئی ✓',
            rejected: 'مسترد',
            error: 'نوٹیفکیشنز لوڈ کرنے میں مسئلہ پیش آیا'
        }
    }[language === 'ur' ? 'ur' : 'en']);

    const fetchNotifications = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${BASE_URL}/api/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 60000);

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setNotifications(notifications.map(n =>
                    n.id === id ? { ...n, is_read: true } : n
                ));
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/notifications/read-all`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    // --- ACTIONABLE HANDLERS ---
    const handleViewProfile = async (notification) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/notifications/application-context/${notification.related_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.applicant_profile?.user_id) {
                    setIsOpen(false);
                    navigate(`/profile/${data.applicant_profile.user_id}`);
                }
            }
        } catch (error) {
            console.error('Error viewing profile:', error);
        }
    };

    const handleStatusAction = async (notification, status) => {
        setActionLoading(notification.id + status);
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/jobs/applications/${notification.related_id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                // Mark this notification as read & update its local state to show feedback
                handleMarkAsRead(notification.id);
                setNotifications(prev => prev.map(n =>
                    n.id === notification.id
                        ? { ...n, is_read: true, _actionTaken: status }
                        : n
                ));
            } else {
                const err = await response.json();
                toast.error(err.message || 'Action failed');
            }
        } catch (error) {
            console.error('Error performing action:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="notification-wrapper" ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'relative',
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'inherit',
                    outline: 'none',
                    boxShadow: 'none'
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        background: '#ef4444',
                        color: 'white',
                        borderRadius: '50%',
                        padding: '2px 6px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        minWidth: '18px',
                        textAlign: 'center'
                    }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: language === 'ur' ? 'auto' : '0',
                    left: language === 'ur' ? '0' : 'auto',
                    minWidth: '360px',
                    maxWidth: '420px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    zIndex: 50,
                    marginTop: '8px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>{t.title}</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '500' }}>
                                {t.mark_all_read}
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                                {t.empty}
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    style={{
                                        padding: '12px 16px',
                                        borderBottom: '1px solid #f1f5f9',
                                        background: notification.is_read ? 'white' : '#eff6ff',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ fontSize: '1.2rem', marginTop: '2px' }}>
                                            {notification.type === 'NEW_APPLICANT' ? '👤' :
                                             notification.type === 'STATUS_UPDATE' ? 'ℹ️' : 
                                             notification.type === 'COMPLAINT_UPDATE' ? '🛡️' : 
                                             notification.type === 'TE_HIRE_REQUEST' ? '✈️' : '🔔'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{
                                                margin: '0 0 4px 0',
                                                fontSize: '0.9rem',
                                                color: '#1e293b',
                                                fontWeight: notification.is_read ? '400' : '600'
                                            }}>
                                                {notification.message}
                                            </p>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                {new Date(notification.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {!notification.is_read && (
                                            <div style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%', alignSelf: 'center', flexShrink: 0 }} />
                                        )}
                                    </div>

                                    {/* ACTION BUTTONS for NEW_APPLICANT notifications */}
                                    {notification.type === 'NEW_APPLICANT' && notification.related_id && (
                                        <div style={{
                                            marginTop: '8px',
                                            paddingTop: '8px',
                                            borderTop: '1px solid #e2e8f0',
                                            display: 'flex',
                                            gap: '8px',
                                            flexWrap: 'wrap'
                                        }}>
                                            {notification._actionTaken ? (
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600',
                                                    color: notification._actionTaken === 'Offered' ? '#16a34a' : '#dc2626',
                                                    background: notification._actionTaken === 'Offered' ? '#f0fdf4' : '#fef2f2',
                                                    padding: '4px 12px',
                                                    borderRadius: '6px'
                                                }}>
                                                    {notification._actionTaken === 'Offered' ? t.hired : t.rejected}
                                                </span>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleViewProfile(notification)}
                                                        style={{
                                                            fontSize: '0.78rem',
                                                            padding: '4px 10px',
                                                            border: '1px solid #4f46e5',
                                                            background: 'white',
                                                            color: '#4f46e5',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontWeight: '500'
                                                        }}
                                                    >
                                                        {t.view_profile}
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusAction(notification, 'Offered')}
                                                        disabled={actionLoading === notification.id + 'Offered'}
                                                        style={{
                                                            fontSize: '0.78rem',
                                                            padding: '4px 10px',
                                                            border: 'none',
                                                            background: '#16a34a',
                                                            color: 'white',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontWeight: '500',
                                                            opacity: actionLoading === notification.id + 'Offered' ? 0.6 : 1
                                                        }}
                                                    >
                                                        {actionLoading === notification.id + 'Offered' ? '...' : t.hire}
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusAction(notification, 'Rejected')}
                                                        disabled={actionLoading === notification.id + 'Rejected'}
                                                        style={{
                                                            fontSize: '0.78rem',
                                                            padding: '4px 10px',
                                                            border: 'none',
                                                            background: '#dc2626',
                                                            color: 'white',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontWeight: '500',
                                                            opacity: actionLoading === notification.id + 'Rejected' ? 0.6 : 1
                                                        }}
                                                    >
                                                        {actionLoading === notification.id + 'Rejected' ? '...' : t.reject}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
