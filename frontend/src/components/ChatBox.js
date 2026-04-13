import React, { useState, useEffect, useRef } from 'react';
import '../index.css';

const ChatBox = ({ session, currentUser, onClose, onCloseWidget, onSessionUpdated }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Determine the "other person" in the chat
    const isEmployer = currentUser.role === 'employer';
    const otherPersonName = isEmployer 
        ? session.candidate?.full_name 
        : session.employer?.company_name || session.employer?.full_name;
    const otherPersonInitials = otherPersonName ? otherPersonName.charAt(0).toUpperCase() : '?';

    // Fetch message history
    useEffect(() => {
        const fetchMessages = async (isPolling = false) => {
            if (!session) return;
            if (!isPolling) setLoading(true);
            try {
                const token = sessionStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/chat/${session.id}/messages`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    // Only scroll/mark and update state if there are new messages
                    setMessages(prev => {
                        if (prev.length !== data.length) {
                            setTimeout(scrollToBottom, 100);
                            markAsRead();
                        }
                        return data;
                    });
                }
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            } finally {
                if (!isPolling) setLoading(false);
            }
        };

        const markAsRead = async () => {
            try {
                const token = sessionStorage.getItem('token');
                await fetch(`http://localhost:5000/api/chat/${session.id}/read`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (error) {
                console.error("Failed to mark as read", error);
            }
        };

        fetchMessages(false);

        // Use efficient polling every 1 second to feel instantaneous without websockets
        const pollInterval = window.setInterval(() => fetchMessages(true), 1000);

        return () => {
            window.clearInterval(pollInterval);
        };
    }, [session]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const currentMsg = newMessage.trim();
        setNewMessage(''); // optimistic clear

        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/chat/${session.id}/message`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ content: currentMsg })
            });

            if (!res.ok) {
                setNewMessage(currentMsg); // Revert on fail
                console.error("Failed to send message");
            }
        } catch (error) {
            setNewMessage(currentMsg); // Revert on fail
            console.error("Error sending message:", error);
        }
    };

    if (!session) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            {/* Header */}
            <div className="chatbox-header">
                <button className="chatbox-close-btn" onClick={onClose} title="Back to Sessions" style={{ marginRight: '10px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <div className="chatbox-header-info" style={{ flex: 1 }}>
                    <div className="chatbox-avatar">{otherPersonInitials}</div>
                    <div>
                        <h3 className="chatbox-name">{otherPersonName}</h3>
                        <p className="chatbox-job">{session.jobs?.title}</p>
                    </div>
                </div>
                <button className="chatbox-close-btn" onClick={onCloseWidget} title="Close Chat Widget" style={{ color: '#ef4444', background: '#fee2e2' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            {/* Messages Area */}
            <div className="chatbox-messages">
                {loading ? (
                    <div className="loading-state" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="spinner"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="empty-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '10px' }}>
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <p>No messages yet. Send a message to start chatting!</p>
                    </div>
                ) : (
                    <>
                        <div className="chatbox-date-divider">Start of Chat</div>
                        {messages.map((msg, index) => {
                            // The user's role determines which session ID holds their profile ID
                            const isMine = isEmployer ? msg.sender_id === session.employer_id : msg.sender_id === session.candidate_id;
                            
                            // Format timestamp nicely
                            const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            return (
                                <div key={msg.id || index} className={`chat-message-row ${isMine ? 'mine' : 'theirs'}`}>
                                    <div className={`chat-bubble ${isMine ? 'mine' : 'theirs'}`}>
                                        <p>{msg.content}</p>
                                        <span className="chat-time">{time}</span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="chatbox-input-area">
                <form onSubmit={handleSendMessage} style={{ display: 'flex', width: '100%', gap: '10px' }}>
                    <input 
                        type="text" 
                        className="chatbox-input"
                        placeholder="Type a message..." 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        required
                    />
                    <button type="submit" className="chatbox-send-btn" disabled={!newMessage.trim()}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatBox;
