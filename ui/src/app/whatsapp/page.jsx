'use client';
import { useEffect } from 'react';
import '../../styles/whatsapp/glass-ui.css';
import ThemeManager from './components/ThemeManager';
import WhatsAppGlassUI from './components/WhatsAppGlassUI';

const WhatsAppPage = () => {
  useEffect(() => {
    const themeManager = new ThemeManager();
    const whatsappUI = new WhatsAppGlassUI();
    
    return () => {
      // Cleanup if necessary
    };
  }, []);

  return (
    <>
      {/* The entire UI is rendered by the WhatsAppGlassUI class, so we just need the basic HTML structure. */}
      <div className="controls-panel">
        <div className="theme-selector">
            <button className="theme-btn" data-theme="default" title="Ocean Blue">🌊</button>
            <button className="theme-btn" data-theme="sunset" title="Sunset">🌅</button>
            <button className="theme-btn" data-theme="forest" title="Forest">🌲</button>
            <button className="theme-btn" data-theme="ocean" title="Deep Ocean">🌊</button>
            <button className="theme-btn" data-theme="purple" title="Purple Dream">💜</button>
            <button className="theme-btn" data-theme="rose" title="Rose Gold">🌹</button>
        </div>
        
        <div className="mode-toggle">
            <button id="modeToggle" className="mode-btn">🌙</button>
        </div>
    </div>

    <div className="app-container">
        <header className="app-header glass-header">
            <div className="header-content">
                <div className="header-left">
                    <div className="logo-container">
                        <div className="logo-icon">💬</div>
                        <h1>WhatsApp Web</h1>
                    </div>
                </div>
                <div className="ai-chat-toggle">
                    <button id="aiToggle" className="ai-btn glass-btn">
                        <span>🤖 AI Assistant</span>
                    </button>
                </div>
                <div className="header-actions">
                    <button id="profileToggle" className="profile-btn glass-btn">
                        <img id="profilePic" src="/placeholder.svg?height=40&width=40" alt="Profile" className="profile-avatar" />
                        <span id="userInfo" className="user-info"></span>
                    </button>
                    <button id="logoutBtn" className="btn btn-secondary glass-btn">Logout</button>
                </div>
            </div>
        </header>

        <div id="profilePopup" className="profile-popup glass-card">
            <div className="profile-header">
                <img id="profilePopupPic" src="/placeholder.svg?height=80&width=80" alt="Profile" className="profile-large" />
                <div className="profile-info">
                    <h3 id="profileName">User Name</h3>
                    <p id="profileId">ID: 12345</p>
                    <span id="profileStatus" className="status-indicator">🟢 Online</span>
                </div>
            </div>
            <div className="profile-actions">
                <button className="btn glass-btn">Edit Profile</button>
                <button className="btn glass-btn">Settings</button>
                <button id="closeProfile" className="btn btn-secondary glass-btn">Close</button>
            </div>
        </div>

        <div id="aiChatModal" className="ai-chat-modal">
            <div className="ai-chat-container glass-card">
                <div className="ai-chat-header">
                    <div className="ai-info">
                        <div className="ai-avatar">🤖</div>
                        <div>
                            <h3>AI Assistant</h3>
                            <p>Ask me anything!</p>
                        </div>
                    </div>
                    <button id="closeAiChat" className="close-btn">✕</button>
                </div>
                
                <div className="ai-chat-messages" id="aiChatMessages">
                    <div className="ai-message">
                        <div className="ai-avatar-small">🤖</div>
                        <div className="message-content">
                            <p>Hello! I'm your AI assistant. How can I help you today?</p>
                        </div>
                    </div>
                </div>
                
                <div className="ai-chat-input">
                    <div className="input-container glass-input-container">
                        <input type="text" style={{height: '40px'}} id="aiMessageInput" placeholder="Ask me anything..." className="glass-input" />
                        <button id="sendAiMessage" className="send-btn glass-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22,2 15,22 11,13 2,9"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <main className="main-content">
            <aside className="sidebar glass-panel">
                <div className="sidebar-header">
                    <h2>Chats</h2>
                    <div className="sidebar-actions">
                        <button id="refreshChats" className="btn-icon glass-btn" title="Refresh">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <polyline points="1 20 1 14 7 14"></polyline>
                                <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                        </button>
                        <button id="newChatBtn" className="btn-icon glass-btn" title="New Chat">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div className="search-container">
                    <div className="search-box glass-input-container">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <input type="text" id="searchChats" placeholder="Search chats..." className="glass-input" />
                    </div>
                </div>
                
                <div id="chatsList" className="chats-list">
                    <div className="loading glass-loading">
                        <div className="loading-spinner"></div>
                        <span>Loading chats...</span>
                    </div>
                </div>
            </aside>

            <section className="chat-area">
                <div id="statusOverlay" className="status-overlay">
                    <div className="status-content glass-card">
                        <div className="status-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </div>
                        <h3 id="statusTitle">Connecting to WhatsApp...</h3>
                        <p id="statusMessage">Please wait while we establish connection</p>
                        <div id="qrCodeContainer" className="qr-container"></div>
                        <div className="loading-spinner"></div>
                    </div>
                </div>

                <div id="chatHeader" className="chat-header glass-header" style={{display: 'none'}}>
                    <div className="chat-header-info">
                        <img id="chatAvatar" src="/placeholder.svg?height=50&width=50" alt="Chat Avatar" className="chat-avatar" />
                        <div className="chat-details">
                            <h3 id="chatName">Select a chat</h3>
                            <span id="chatStatus" className="chat-status">🟢 Online</span>
                        </div>
                    </div>
                    <div className="chat-actions">
                        <button className="btn-icon glass-btn" title="Video Call">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                            </svg>
                        </button>
                        <button className="btn-icon glass-btn" title="Voice Call">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                        </button>
                        <button className="btn-icon glass-btn" title="More Options">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="12" cy="5" r="1"></circle>
                                <circle cx="12" cy="19" r="1"></circle>
                            </svg>
                        </button>
                    </div>
                </div>

                <div id="messagesArea" className="messages-area" style={{display: 'none'}}>
                    <div className="background-customizer">
                        <input type="color" id="colorPicker" title="Change background color" />
                        <button id="resetBg" className="btn-icon glass-btn" title="Reset background">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                            </svg>
                        </button>
                    </div>
                    <div id="messagesList" className="messages-list"></div>
                </div>

                <div id="messageInput" className="message-input glass-panel" style={{display: 'none'}}>
                    <div className="input-container">
                        <div className="input-actions">
                            <button id="attachBtn" className="btn-icon glass-btn" title="Attach File">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"></path>
                                </svg>
                            </button>
                            <button id="emojiBtn" className="btn-icon glass-btn" title="Emoji">😊</button>
                            <button id="voiceBtn" className="btn-icon glass-btn" title="Voice Message">🎤</button>
                        </div>
                        
                        <div className="text-input-container glass-input-container">
                            <input type="text" id="messageText" style={{height: '30px'}} placeholder="Type a message..." className="glass-input" />
                        </div>
                        
                        <button id="sendBtn" className="send-btn glass-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22,2 15,22 11,13 2,9"></polygon>
                            </svg>
                        </button>
                    </div>

                    <div id="fileUploadArea" className="file-upload-area glass-card" style={{display: 'none'}}>
                        <div className="file-upload-header">
                            <h3>Send Files</h3>
                            <button id="closeFileUpload" className="close-btn">✕</button>
                        </div>
                        
                        <div className="file-upload-content">
                            <div className="file-drop-zone" id="fileDropZone">
                                <div className="drop-zone-content">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14,2 14,8 20,8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10,9 9,9 8,9"></polyline>
                                    </svg>
                                    <p>Drag & drop files here or click to browse</p>
                                    <input type="file" id="fileInput" accept="*/*" multiple hidden />
                                </div>
                            </div>
                            
                            <div className="file-types">
                                <button className="file-type-btn glass-btn" data-accept="image/*">📷 Images</button>
                                <button className="file-type-btn glass-btn" data-accept="video/*">🎥 Videos</button>
                                <button className="file-type-btn glass-btn" data-accept="audio/*">🎵 Audio</button>
                                <button className="file-type-btn glass-btn" data-accept=".pdf,.doc,.docx">📄 Documents</button>
                            </div>
                            
                            <div className="file-preview" id="filePreview"></div>
                            
                            <div className="file-actions">
                                <div className="file-caption-container glass-input-container">
                                    <input type="text" id="fileCaption" placeholder="Add a caption..." className="glass-input" />
                                </div>
                                <div className="file-buttons">
                                    <button id="sendFileBtn" className="btn btn-primary glass-btn">Send Files</button>
                                    <button id="cancelFileBtn" className="btn btn-secondary glass-btn">Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <div id="toastContainer" className="toast-container"></div>
    </>
  );
};

export default WhatsAppPage;