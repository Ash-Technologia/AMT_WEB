import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import API from '../services/api';
import toast from 'react-hot-toast';
import './Auth.css';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await API.post(`/auth/reset-password/${token}`, { password });
            toast.success('Password reset successfully!');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Reset link expired or invalid');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet><title>Reset Password — AMT</title></Helmet>
            <div className="auth-page">
                <div className="auth-bg" />
                <motion.div className="auth-card glass-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="auth-logo"><span className="auth-logo-text">AMT</span></div>
                    <h1 className="auth-title">New Password</h1>
                    <p className="auth-subtitle">Enter your new password</p>
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <div className="input-wrapper">
                                <FiLock className="input-icon" />
                                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="form-input input-with-icon input-with-icon-right" placeholder="Min 6 characters" required minLength={6} />
                                <button type="button" className="input-icon-right" onClick={() => setShowPass(!showPass)}>
                                    {showPass ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </>
    );
};

export default ResetPassword;
