import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMail } from 'react-icons/fi';
import API from '../../services/api';
import toast from 'react-hot-toast';
import './NewsletterPopup.css';

const NewsletterPopup = () => {
    const [visible, setVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const dismissed = sessionStorage.getItem('amt_newsletter_dismissed');
        if (!dismissed) {
            const timer = setTimeout(() => setVisible(true), 5000);
            return () => clearTimeout(timer);
        }
    }, []);

    const dismiss = () => {
        setVisible(false);
        sessionStorage.setItem('amt_newsletter_dismissed', 'true');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;
        try {
            setLoading(true);
            await API.post('/newsletter/subscribe', { email });
            toast.success('🌿 Welcome to the AMT family!');
            setEmail('');
            dismiss();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Subscription failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="newsletter-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={dismiss}
                >
                    <motion.div
                        className="newsletter-popup glass-card"
                        initial={{ opacity: 0, scale: 0.8, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 40 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button className="newsletter-close" onClick={dismiss}><FiX /></button>
                        <div className="newsletter-icon">🌿</div>
                        <h3 className="newsletter-title">Join the AMT Wellness Circle</h3>
                        <p className="newsletter-desc">
                            Get exclusive health tips, early access to new products, and special offers delivered to your inbox.
                        </p>
                        <form className="newsletter-form" onSubmit={handleSubmit}>
                            <div className="newsletter-input-wrapper">
                                <FiMail className="newsletter-input-icon" />
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="newsletter-input"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Subscribing...' : 'Subscribe & Save 10%'}
                            </button>
                        </form>
                        <p className="newsletter-privacy">No spam, unsubscribe anytime. 🔒</p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NewsletterPopup;
