import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiPhone } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Register = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [step, setStep] = useState('register'); // register | otp
    const [otp, setOtp] = useState('');
    const [userId, setUserId] = useState(null);
    const googleBtnRef = useRef(null);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    // Google Identity Services
    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) return;
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => initGoogle();
        document.head.appendChild(script);
        return () => { document.head.removeChild(script); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const initGoogle = () => {
        if (!window.google || !googleBtnRef.current) return;
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCallback,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: googleBtnRef.current.offsetWidth || 360,
            text: 'signup_with',
            shape: 'rectangular',
        });
    };

    const handleGoogleCallback = async (response) => {
        try {
            setGoogleLoading(true);
            const res = await API.post('/auth/google', { credential: response.credential });
            login(res.data.token, res.data.user);
            toast.success(`Welcome to AMT, ${res.data.user.name}! 🌿`);
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Google sign-up failed');
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await API.post('/auth/register', form);
            setUserId(res.data.userId);
            setStep('otp');
            toast.success('OTP sent to your email! Please verify to complete registration.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleOTP = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await API.post('/auth/verify-otp', { userId, otp });
            login(res.data.token, res.data.user);
            toast.success(`Welcome to AMT, ${res.data.user.name}! 🌿`);
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet><title>Register — AMT Advanced Medical Therapeutics</title></Helmet>
            <div className="auth-page">
                <div className="auth-bg" />
                <motion.div
                    className="auth-card glass-card"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="auth-logo">
                        <span className="auth-logo-text">AMT</span>
                    </div>
                    <h1 className="auth-title">{step === 'otp' ? 'Verify Email' : 'Create Account'}</h1>
                    <p className="auth-subtitle">
                        {step === 'otp'
                            ? `Enter the OTP sent to ${form.email}`
                            : 'Join the AMT wellness community'}
                    </p>

                    {/* Google Sign-Up (only on register step) */}
                    {step === 'register' && GOOGLE_CLIENT_ID && (
                        <>
                            <div
                                ref={googleBtnRef}
                                className="google-btn-container"
                                style={{ opacity: googleLoading ? 0.6 : 1, pointerEvents: googleLoading ? 'none' : 'auto' }}
                            />
                            <div className="auth-divider">
                                <span>or register with email</span>
                            </div>
                        </>
                    )}

                    {step === 'register' ? (
                        <form onSubmit={handleRegister} className="auth-form">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <div className="input-wrapper">
                                    <FiUser className="input-icon" />
                                    <input type="text" name="name" value={form.name} onChange={handleChange} className="form-input input-with-icon" placeholder="Your full name" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div className="input-wrapper">
                                    <FiMail className="input-icon" />
                                    <input type="email" name="email" value={form.email} onChange={handleChange} className="form-input input-with-icon" placeholder="your@email.com" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <div className="input-wrapper">
                                    <FiPhone className="input-icon" />
                                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="form-input input-with-icon" placeholder="+91 XXXXX XXXXX" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div className="input-wrapper">
                                    <FiLock className="input-icon" />
                                    <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} className="form-input input-with-icon input-with-icon-right" placeholder="Min 6 characters" required minLength={6} />
                                    <button type="button" className="input-icon-right" onClick={() => setShowPass(!showPass)}>
                                        {showPass ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleOTP} className="auth-form">
                            <div className="form-group">
                                <label className="form-label">OTP Code</label>
                                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} className="form-input otp-input" placeholder="Enter 6-digit OTP" maxLength={6} required />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify & Complete Registration'}
                            </button>
                            <button type="button" className="btn btn-glass" style={{ width: '100%' }} onClick={() => setStep('register')}>
                                Back
                            </button>
                        </form>
                    )}

                    <p className="auth-switch">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </motion.div>
            </div>
        </>
    );
};

export default Register;
