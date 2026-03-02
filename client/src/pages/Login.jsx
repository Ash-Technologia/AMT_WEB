import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiPhone, FiArrowRight } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const [loginMethod, setLoginMethod] = useState('email'); // 'email' | 'phone'
    const [form, setForm] = useState({ email: '', password: '' });
    const [phone, setPhone] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [step, setStep] = useState('login'); // login | otp | phone-otp
    const [otp, setOtp] = useState('');
    const [maskedEmail, setMaskedEmail] = useState('');
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
            text: 'signin_with',
            shape: 'rectangular',
        });
    };

    const handleGoogleCallback = async (response) => {
        try {
            setGoogleLoading(true);
            const res = await API.post('/auth/google', { credential: response.credential });
            login(res.data.token, res.data.user);
            toast.success(`Welcome, ${res.data.user.name}! 🌿`);
            navigate(redirect);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Google sign-in failed');
        } finally {
            setGoogleLoading(false);
        }
    };

    // Email Login
    const handleEmailLogin = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await API.post('/auth/login', form);
            if (res.data.requiresOTP) {
                setStep('otp');
                toast.success('OTP sent to your email!');
            } else {
                login(res.data.token, res.data.user);
                toast.success(`Welcome back, ${res.data.user.name}! 🌿`);
                navigate(redirect);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    // Email OTP Verify
    const handleEmailOTP = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await API.post('/auth/verify-otp', { email: form.email, otp });
            login(res.data.token, res.data.user);
            toast.success(`Welcome back, ${res.data.user.name}! 🌿`);
            navigate(redirect);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    // Send Phone OTP
    const handleSendPhoneOTP = async (e) => {
        e.preventDefault();
        if (!phone.trim()) { toast.error('Please enter your phone number'); return; }
        try {
            setLoading(true);
            const res = await API.post('/auth/send-phone-otp', { phone: phone.trim() });
            setMaskedEmail(res.data.maskedEmail || '');
            setStep('phone-otp');
            toast.success(res.data.message);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // Verify Phone OTP
    const handlePhoneOTP = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await API.post('/auth/verify-phone-otp', { phone: phone.trim(), otp });
            login(res.data.token, res.data.user);
            toast.success(`Welcome back, ${res.data.user.name}! 🌿`);
            navigate(redirect);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const resetFlow = () => {
        setStep('login');
        setOtp('');
        setMaskedEmail('');
    };

    const isMainStep = step === 'login';

    return (
        <>
            <Helmet><title>Login — AMT Advanced Medical Therapeutics</title></Helmet>
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

                    {step === 'otp' || step === 'phone-otp' ? (
                        <>
                            <h1 className="auth-title">Verify OTP</h1>
                            <p className="auth-subtitle">
                                {step === 'otp'
                                    ? `Code sent to ${form.email}`
                                    : `Code sent to your email ${maskedEmail}`}
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="auth-title">Welcome Back</h1>
                            <p className="auth-subtitle">Sign in to your AMT account</p>

                            {/* Google Sign-In */}
                            {GOOGLE_CLIENT_ID && (
                                <>
                                    <div
                                        ref={googleBtnRef}
                                        className="google-btn-container"
                                        style={{ opacity: googleLoading ? 0.6 : 1, pointerEvents: googleLoading ? 'none' : 'auto' }}
                                    />
                                    <div className="auth-divider">
                                        <span>or continue with</span>
                                    </div>
                                </>
                            )}

                            {/* Method Toggle */}
                            <div className="auth-method-toggle">
                                <button
                                    type="button"
                                    className={`auth-method-btn ${loginMethod === 'email' ? 'active' : ''}`}
                                    onClick={() => setLoginMethod('email')}
                                >
                                    <FiMail /> Email
                                </button>
                                <button
                                    type="button"
                                    className={`auth-method-btn ${loginMethod === 'phone' ? 'active' : ''}`}
                                    onClick={() => setLoginMethod('phone')}
                                >
                                    <FiPhone /> Phone
                                </button>
                            </div>
                        </>
                    )}

                    <AnimatePresence mode="wait">
                        {/* ── Email Login ─────────────────── */}
                        {isMainStep && loginMethod === 'email' && (
                            <motion.form
                                key="email-login"
                                onSubmit={handleEmailLogin}
                                className="auth-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.25 }}
                            >
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <div className="input-wrapper">
                                        <FiMail className="input-icon" />
                                        <input
                                            type="email" name="email" value={form.email}
                                            onChange={handleChange} className="form-input input-with-icon"
                                            placeholder="your@email.com" required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <div className="input-wrapper">
                                        <FiLock className="input-icon" />
                                        <input
                                            type={showPass ? 'text' : 'password'} name="password"
                                            value={form.password} onChange={handleChange}
                                            className="form-input input-with-icon input-with-icon-right"
                                            placeholder="Your password" required
                                        />
                                        <button type="button" className="input-icon-right" onClick={() => setShowPass(!showPass)}>
                                            {showPass ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-between" style={{ marginBottom: 'var(--space-md)' }}>
                                    <span />
                                    <Link to="/forgot-password" style={{ fontSize: '0.875rem', color: 'var(--primary-light)' }}>
                                        Forgot Password?
                                    </Link>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                                    {loading ? 'Signing in...' : <><span>Sign In</span> <FiArrowRight /></>}
                                </button>
                            </motion.form>
                        )}

                        {/* ── Phone Login ─────────────────── */}
                        {isMainStep && loginMethod === 'phone' && (
                            <motion.form
                                key="phone-login"
                                onSubmit={handleSendPhoneOTP}
                                className="auth-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.25 }}
                            >
                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <div className="input-wrapper">
                                        <FiPhone className="input-icon" />
                                        <input
                                            type="tel" value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            className="form-input input-with-icon"
                                            placeholder="+91 98765 43210"
                                            required
                                        />
                                    </div>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
                                        OTP will be sent to the email linked to this phone number
                                    </p>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                                    {loading ? 'Sending OTP...' : <><span>Send OTP</span> <FiArrowRight /></>}
                                </button>
                            </motion.form>
                        )}

                        {/* ── Email OTP Verify ─────────────── */}
                        {step === 'otp' && (
                            <motion.form
                                key="email-otp"
                                onSubmit={handleEmailOTP}
                                className="auth-form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.25 }}
                            >
                                <div className="form-group">
                                    <label className="form-label">OTP Code</label>
                                    <input
                                        type="text" value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        className="form-input otp-input"
                                        placeholder="Enter 6-digit OTP"
                                        maxLength={6} required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                                <button type="button" className="btn btn-glass" style={{ width: '100%' }} onClick={resetFlow}>
                                    Back to Login
                                </button>
                            </motion.form>
                        )}

                        {/* ── Phone OTP Verify ─────────────── */}
                        {step === 'phone-otp' && (
                            <motion.form
                                key="phone-otp"
                                onSubmit={handlePhoneOTP}
                                className="auth-form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.25 }}
                            >
                                <div className="form-group">
                                    <label className="form-label">OTP Code</label>
                                    <input
                                        type="text" value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        className="form-input otp-input"
                                        placeholder="Enter 6-digit OTP"
                                        maxLength={6} required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                                    {loading ? 'Verifying...' : 'Verify & Login'}
                                </button>
                                <button type="button" className="btn btn-glass" style={{ width: '100%' }} onClick={resetFlow}>
                                    Back to Login
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <p className="auth-switch">
                        Don't have an account? <Link to="/register">Create one</Link>
                    </p>
                </motion.div>
            </div>
        </>
    );
};

export default Login;
