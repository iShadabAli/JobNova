import React, { useState, useEffect } from 'react';
import ChatBox from './ChatBox';
import '../index.css';
import { BASE_URL } from '../utils/api';

const ChatWidget = ({ currentUser }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeSession, setActiveSession] = useState(null);
    const [myProfileId, setMyProfileId] = useState(null);

    // Fetch the current user's profile ID so we can match against session IDs
    useEffect(() => {
        const fetchMyProfileId = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const res = await fetch(`${BASE_URL}/api/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setMyProfileId(data.id);
                }
            } catch (error) {
                console.error('Failed to fetch profile ID for chat:', error);
            }
        };
        fetchMyProfileId();
    }, []);

    // Derive total unread count from the sessions
    const totalUnreadCount = sessions.reduce((sum, session) => sum + (session.unreadCount || 0), 0);

    // Fetch sessions
    const fetchSessions = async (isPolling = false) => {
        if (!isPolling) setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/api/chat/sessions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
            }
        } catch (error) {
            console.error("Failed to fetch chat sessions:", error);
        } finally {
            if (!isPolling) setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch and start 5s polling interval
        fetchSessions(false);
        const pollInterval = window.setInterval(() => fetchSessions(true), 5000);

        return () => window.clearInterval(pollInterval);
    }, []);

    // Expose a global method to open chat from outside (e.g. Employer clicking "Message" candidate)
    useEffect(() => {
        const handleOpenChat = (e) => {
            const { session } = e.detail;
            setActiveSession(session);
            setIsOpen(true);
        };
        window.addEventListener('open-chat', handleOpenChat);
        return () => window.removeEventListener('open-chat', handleOpenChat);
    }, []);

    const handleSessionUpdated = (sessionId, newMsg) => {
        // Move session to top when new msg arrives
        setSessions(prev => {
            const sessionIndex = prev.findIndex(s => s.id === sessionId);
            if (sessionIndex === -1) return prev;
            const updatedSessions = [...prev];
            const [session] = updatedSessions.splice(sessionIndex, 1);
            session.updated_at = new Date().toISOString();
            return [session, ...updatedSessions];
        });
    };

    const getOtherPersonName = (session) => {
        // Use profile ID matching to reliably determine who the "other person" is
        if (myProfileId) {
            const iAmEmployer = session.employer_id === myProfileId;
            return iAmEmployer
                ? session.candidate?.full_name
                : session.employer?.company_name || session.employer?.full_name;
        }
        // Fallback to role-based check
        const isEmployer = currentUser.role === 'employer';
        return isEmployer
            ? session.candidate?.full_name
            : session.employer?.company_name || session.employer?.full_name;
    };

    if (!isOpen) {
        return (
            <button className="chat-widget-fab" onClick={() => setIsOpen(true)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                {totalUnreadCount > 0 && <span className="chat-badge">{totalUnreadCount}</span>}
            </button>
        );
    }

    return (
        <div className="chatbox-container">
            {activeSession ? (
                <ChatBox
                    session={activeSession}
                    currentUser={currentUser}
                    onClose={() => setActiveSession(null)}
                    onCloseWidget={() => {
                        setActiveSession(null);
                        setIsOpen(false);
                    }}
                    onSessionUpdated={handleSessionUpdated}
                />
            ) : (
                <>
                    {/* Header */}
                    <div className="chatbox-header">
                        <div className="chatbox-header-info">
                            <h3 className="chatbox-name">Your Messages</h3>
                        </div>
                        <button className="chatbox-close-btn" onClick={() => setIsOpen(false)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    {/* Chat Sessions List */}
                    <div className="chatbox-messages" style={{ padding: 0 }}>
                        {loading ? (
                            <div className="loading-state" style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
                        ) : sessions.length === 0 ? (
                            <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '10px' }}>
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                <p>No active conversations.</p>
                            </div>
                        ) : (
                            <div className="chatbox-sessions-list" style={{ boxShadow: 'none', margin: 0, borderRadius: 0 }}>
                                {sessions.map(session => (
                                    <div
                                        key={session.id}
                                        className={`chat-session-item ${session.unreadCount > 0 ? 'unread' : ''}`}
                                        onClick={() => setActiveSession(session)}
                                    >
                                        <div className="chat-session-avatar">
                                            {getOtherPersonName(session)?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="chat-session-info">
                                            <h4 className="chat-session-name">{getOtherPersonName(session)}</h4>
                                            <p className="chat-session-job">{session.jobs?.title}</p>
                                        </div>
                                        {session.unreadCount > 0 && (
                                            <div className="chat-unread-badge-small">
                                                {session.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ChatWidget;
