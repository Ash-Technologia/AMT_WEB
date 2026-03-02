import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import API from '../services/api';
import toast from 'react-hot-toast';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await API.post('/auth/forgot-password', { email });
            setSent(true);
            toast.success('Password reset email sent!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet><title>Forgot Password — AMT</title></Helmet>
            <div className="auth-page">
                <div className="auth-bg" />
                <motion.div className="auth-card glass-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="auth-logo"><span className="auth-logo-text">AMT</span></div>
                    <h1 className="auth-title">Reset Password</h1>
                    <p className="auth-subtitle">Enter your email to receive a reset link</p>
                    {sent ? (
                        <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                            <span style={{ fontSize: '3rem' }}>📧</span>
                            <p style={{ marginTop: 'var(--space-md)', color: 'var(--text-secondary)' }}>
                                Check your inbox at <strong>{email}</strong> for the password reset link.
                            </p>
                            <Link to="/login" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>Back to Login</Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div className="input-wrapper">
                                    <FiMail className="input-icon" />
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input input-with-icon" placeholder="your@email.com" required />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    )}
                    <p className="auth-switch"><Link to="/login">← Back to Login</Link></p>
                </motion.div>
            </div>
        </>
    );
};

export default ForgotPassword;
