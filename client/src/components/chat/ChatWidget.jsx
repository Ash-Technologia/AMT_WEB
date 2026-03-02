import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';
import API from '../../services/api';
import './ChatWidget.css';

const ChatWidget = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', content: 'Hello! 👋 I\'m the AMT AI assistant. How can I help you today? Ask me about our therapy products, pricing, or anything health-related!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const res = await API.post('/chat', { message: userMessage, history });
            setMessages(prev => [...prev, { role: 'model', content: res.data.response }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'model',
                content: 'Sorry, I\'m having trouble connecting. Please contact us at amrutsinghavi@gmail.com or call +91 98228 43015.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-widget">
            {/* Chat Window */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        className="chat-window glass-card"
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* Header */}
                        <div className="chat-header">
                            <div className="chat-header__info">
                                <div className="chat-avatar">🌿</div>
                                <div>
                                    <p className="chat-header__name">AMT Assistant</p>
                                    <p className="chat-header__status">
                                        <span className="status-dot" /> Online
                                    </p>
                                </div>
                            </div>
                            <button className="icon-btn" onClick={() => setOpen(false)}><FiX /></button>
                        </div>

                        {/* Messages */}
                        <div className="chat-messages">
                            {messages.map((msg, i) => (
                                <div key={i} className={`chat-message chat-message--${msg.role}`}>
                                    {msg.content.split('\n').filter(Boolean).map((line, j) => {
                                        // Bold: **text**
                                        const parts = line.split(/\*\*(.+?)\*\*/g);
                                        return (
                                            <p key={j} style={{ margin: j > 0 ? '4px 0 0' : 0 }}>
                                                {parts.map((part, k) =>
                                                    k % 2 === 1 ? <strong key={k}>{part}</strong> : part
                                                )}
                                            </p>
                                        );
                                    })}
                                </div>
                            ))}
                            {loading && (
                                <div className="chat-message chat-message--model">
                                    <div className="typing-indicator">
                                        <span /><span /><span />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form className="chat-input-form" onSubmit={sendMessage}>
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Ask about our products..."
                                className="chat-input"
                                disabled={loading}
                            />
                            <button type="submit" className="chat-send-btn" disabled={!input.trim() || loading}>
                                <FiSend />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                className="chat-toggle"
                onClick={() => setOpen(!open)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Open chat"
            >
                <AnimatePresence mode="wait">
                    {open ? (
                        <motion.span key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
                            <FiX />
                        </motion.span>
                    ) : (
                        <motion.span key="open" initial={{ rotate: 90 }} animate={{ rotate: 0 }} exit={{ rotate: -90 }}>
                            <FiMessageCircle />
                        </motion.span>
                    )}
                </AnimatePresence>
                {!open && <span className="chat-toggle__pulse" />}
            </motion.button>
        </div>
    );
};

export default ChatWidget;
