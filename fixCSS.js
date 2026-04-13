const fs = require('fs');
const filePath = 'd:\\FYP\\JobNova\\frontend\\src\\index.css';
let content = fs.readFileSync(filePath, 'utf8');

const startIndex = content.indexOf('.chatbox-close-btn {');
const endIndex = content.indexOf('.chat-message-row.mine {');

const replacement = `.chatbox-close-btn {
  background: rgba(241, 245, 249, 0.8);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chatbox-close-btn:hover {
  background: #fee2e2;
  color: #ef4444;
  transform: rotate(90deg);
}

/* Sessions List */
.chatbox-sessions-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.chat-session-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;
  border: 1px solid transparent;
}

.chat-session-item:hover {
  background: white;
  border-color: #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transform: translateY(-1px);
}

.chat-session-item.unread {
  background: #f0fdf4;
  border-left: 4px solid #10b981;
}

.chat-session-item.unread .chat-session-name {
  font-weight: 800;
}

.chat-session-item .chat-session-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  color: #475569;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.chat-session-item .chat-session-info {
  flex: 1;
  min-width: 0;
}

.chat-session-item .chat-session-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.chat-session-item .chat-session-job {
  margin: 2px 0 0 0;
  font-size: 0.8rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-unread-badge-small {
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

/* Chat Messages Area */
.chatbox-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f8fafc;
  scroll-behavior: smooth;
}

.chatbox-messages::-webkit-scrollbar {
  width: 6px;
}
.chatbox-messages::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}

.chatbox-date-divider {
  text-align: center;
  margin: 10px 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.chat-message-row {
  display: flex;
  width: 100%;
}

`;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(filePath, content);
console.log("CSS fixed successfully.");
