import { useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';
import {
    FiUser, FiMail, FiPhone, FiSave, FiCamera,
    FiLock, FiEye, FiEyeOff, FiBriefcase, FiEdit2,
    FiShield, FiCheck, FiX, FiUpload, FiRefreshCw,
    FiMapPin, FiGlobe, FiInstagram, FiLinkedin, FiCalendar, FiInfo
} from 'react-icons/fi';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import './Profile.css';

// ─── Preset avatars ────────────────────────────────────────────────────────────
const PRESETS = [
    { emoji: '🌿', bg: ['#1a4731', '#2d6a4f'] },
    { emoji: '🌸', bg: ['#7c3d52', '#c9737d'] },
    { emoji: '🦋', bg: ['#2a3f6b', '#4a6baf'] },
    { emoji: '🌞', bg: ['#7a5c00', '#c9a84c'] },
    { emoji: '🍃', bg: ['#1a4d3a', '#52b788'] },
    { emoji: '🔥', bg: ['#7a2c1a', '#e76f51'] },
    { emoji: '💫', bg: ['#4a3080', '#9b8ecf'] },
    { emoji: '🌊', bg: ['#0a3a5c', '#4cc9f0'] },
    { emoji: '🦁', bg: ['#5c4a00', '#c9a84c'] },
    { emoji: '🌙', bg: ['#1a1d2e', '#4a5080'] },
    { emoji: '🎯', bg: ['#7a0a0f', '#e63946'] },
    { emoji: '🧘', bg: ['#1a3a4d', '#457b9d'] },
];

const makeEmojiBase64 = (emoji, bgFrom, bgTo) =>
    new Promise(resolve => {
        const c = document.createElement('canvas');
        c.width = c.height = 300;
        const ctx = c.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 300, 300);
        grad.addColorStop(0, bgFrom);
        grad.addColorStop(1, bgTo);
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(150, 150, 150, 0, Math.PI * 2); ctx.fill();
        ctx.font = '160px serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(emoji, 150, 158);
        resolve(c.toDataURL('image/jpeg', 0.92));
    });

const getCroppedBase64 = (imageSrc, pixelCrop) =>
    new Promise(resolve => {
        const image = new Image();
        image.onload = () => {
            const c = document.createElement('canvas');
            c.width = pixelCrop.width; c.height = pixelCrop.height;
            c.getContext('2d').drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
            resolve(c.toDataURL('image/jpeg', 0.9));
        };
        image.src = imageSrc;
    });

// Helper: compute age from dob
const ageFromDob = (dob) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const Profile = () => {
    const { user, updateUser } = useAuth();

    const [form, setForm] = useState({
        name: user?.name || '',
        profession: user?.profession || '',
        dob: user?.dob ? new Date(user.dob).toISOString().slice(0, 10) : '',
        gender: user?.gender || '',
        city: user?.city || '',
        bio: user?.bio || '',
        website: user?.website || '',
        instagram: user?.instagram || '',
        linkedin: user?.linkedin || '',
        shareProfileWithAdmin: user?.shareProfileWithAdmin || false,
    });
    const [saving, setSaving] = useState(false);

    // Addresses
    const [addresses, setAddresses] = useState([]);
    const [addrLoading, setAddrLoading] = useState(false);
    const [addrForm, setAddrForm] = useState({ fullName: '', phone: '', street: '', city: '', state: '', pincode: '', isDefault: false });
    const [showAddrForm, setShowAddrForm] = useState(false);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                setAddrLoading(true);
                const res = await API.get('/auth/addresses');
                setAddresses(res.data.addresses || []);
            } catch (err) {
                console.error(err);
            } finally {
                setAddrLoading(false);
            }
        };
        if (user) fetchAddresses();
    }, [user]);

    const handleAddrSave = async (e) => {
        e.preventDefault();
        try {
            setAddrLoading(true);
            const res = await API.post('/auth/addresses', addrForm);
            setAddresses(res.data.addresses);
            setShowAddrForm(false);
            setAddrForm({ fullName: '', phone: '', street: '', city: '', state: '', pincode: '', isDefault: false });
            toast.success('Address added!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add address');
        } finally {
            setAddrLoading(false);
        }
    };

    const handleAddrDelete = async (id) => {
        try {
            const res = await API.delete(`/auth/addresses/${id}`);
            setAddresses(res.data.addresses);
            toast.success('Address deleted');
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const handleSetDefault = async (id) => {
        try {
            const res = await API.put(`/auth/addresses/${id}/default`);
            setAddresses(res.data.addresses);
            toast.success('Default address updated');
        } catch (err) {
            toast.error('Failed to set default');
        }
    };

    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
    const [pwLoading, setPwLoading] = useState(false);
    const [showPw, setShowPw] = useState({ current: false, new: false });

    // Phone change — strips +91 so user only types 10 digits
    const [phoneStep, setPhoneStep] = useState('idle');
    const [newPhone, setNewPhone] = useState('');
    const [phoneOtp, setPhoneOtp] = useState('');
    const [phoneLoading, setPhoneLoading] = useState(false);

    // Avatar
    const [avatarPanel, setAvatarPanel] = useState('closed');
    const [busyPreset, setBusyPreset] = useState(null);
    const [cropSrc, setCropSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedPixels, setCroppedPixels] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileRef = useRef();

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    const uploadBase64Avatar = async (base64) => {
        const res = await API.post('/auth/upload-avatar', { image: base64 });
        updateUser(res.data.user);
        toast.success('Profile picture updated! ✨');
        setAvatarPanel('closed'); setCropSrc(null);
    };

    const handlePresetClick = async (p) => {
        setBusyPreset(p.emoji);
        try { await uploadBase64Avatar(await makeEmojiBase64(p.emoji, p.bg[0], p.bg[1])); }
        catch (err) { toast.error(err.response?.data?.message || 'Failed to set avatar'); }
        finally { setBusyPreset(null); }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setCropSrc(reader.result);
        reader.readAsDataURL(file); e.target.value = '';
    };

    const onCropComplete = useCallback((_, pixels) => setCroppedPixels(pixels), []);

    const handleCropSave = async () => {
        try {
            setUploadingAvatar(true);
            await uploadBase64Avatar(await getCroppedBase64(cropSrc, croppedPixels));
        } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
        finally { setUploadingAvatar(false); }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const res = await API.put('/auth/profile', form);
            updateUser(res.data.user);
            toast.success('Profile saved!');
        } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
        finally { setSaving(false); }
    };

    const handlePassword = async (e) => {
        e.preventDefault();
        try {
            setPwLoading(true);
            await API.put('/auth/change-password', pwForm);
            toast.success('Password changed!');
            setPwForm({ currentPassword: '', newPassword: '' });
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setPwLoading(false); }
    };

    const handleRequestPhone = async (e) => {
        e.preventDefault();
        try {
            setPhoneLoading(true);
            // Always send with +91 prefix stripped — backend adds it
            const res = await API.post('/auth/request-phone-change', { newPhone: `+91${newPhone.replace(/\D/g, '')}` });
            toast.success(res.data.message);
            setPhoneStep('verify');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to send OTP'); }
        finally { setPhoneLoading(false); }
    };

    const handleVerifyPhone = async (e) => {
        e.preventDefault();
        try {
            setPhoneLoading(true);
            const res = await API.post('/auth/verify-phone-change', { otp: phoneOtp });
            updateUser(res.data.user);
            toast.success('Phone number updated!');
            setPhoneStep('idle'); setNewPhone(''); setPhoneOtp('');
        } catch (err) { toast.error(err.response?.data?.message || 'Invalid OTP'); }
        finally { setPhoneLoading(false); }
    };

    const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const age = ageFromDob(user?.dob);

    return (
        <>
            <Helmet><title>My Profile — AMT</title></Helmet>

            {/* Crop overlay */}
            <AnimatePresence>
                {cropSrc && (
                    <motion.div className="pcrop-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="pcrop-box" initial={{ scale: 0.93 }} animate={{ scale: 1 }}>
                            <h3 className="pcrop-title">Crop Photo</h3>
                            <div className="pcrop-area">
                                <Cropper image={cropSrc} crop={crop} zoom={zoom} aspect={1}
                                    cropShape="round" showGrid={false}
                                    onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
                            </div>
                            <div className="pcrop-zoom">
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Zoom</span>
                                <input type="range" min={1} max={3} step={0.01} value={zoom}
                                    onChange={e => setZoom(Number(e.target.value))} className="pcrop-slider" />
                            </div>
                            <div className="pcrop-actions">
                                <button className="btn btn-glass" onClick={() => setCropSrc(null)}><FiX /> Cancel</button>
                                <button className="btn btn-primary" onClick={handleCropSave} disabled={uploadingAvatar}>
                                    <FiCheck /> {uploadingAvatar ? 'Uploading…' : 'Use Photo'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="ppage">

                {/* ═══ PROFILE HEADER CARD ════════════════════════════════════ */}
                <div className="pheader-card">
                    {/* Decorative blobs */}
                    <div className="pheader-blob pheader-blob-1" />
                    <div className="pheader-blob pheader-blob-2" />

                    <div className="pheader-inner">
                        {/* Avatar */}
                        <div className="pavatar-wrap">
                            {user?.avatar
                                ? <img src={user.avatar} alt="avatar" className="pavatar-img" />
                                : <div className="pavatar-initials">{initials}</div>
                            }
                            <button className="pavatar-cam-btn" onClick={() => setAvatarPanel(p => p === 'closed' ? 'presets' : 'closed')}>
                                <FiCamera size={13} />
                            </button>
                        </div>

                        {/* Info */}
                        <div className="pheader-info">
                            <div className="pheader-name">{user?.name}</div>
                            <div className="pheader-email">{user?.email}</div>
                            <div className="pheader-meta">
                                {user?.profession && <span className="pmeta-chip pmeta-chip--green"><FiBriefcase size={11} />{user.profession}</span>}
                                {user?.city && <span className="pmeta-chip"><FiMapPin size={11} />{user.city}</span>}
                                {age && <span className="pmeta-chip">🎂 {age} yrs</span>}
                                {user?.shareProfileWithAdmin && <span className="pmeta-chip pmeta-chip--blue">🔓 Shared</span>}
                            </div>
                            {user?.bio && <p className="pheader-bio">{user.bio}</p>}
                            <div className="pheader-socials">
                                {user?.phone && <span className="psocial-link"><FiPhone size={13} />{user.phone}</span>}
                                {user?.website && <a href={user.website} target="_blank" rel="noreferrer" className="psocial-link"><FiGlobe size={13} />Website</a>}
                                {user?.instagram && <a href={`https://instagram.com/${user.instagram}`} target="_blank" rel="noreferrer" className="psocial-link psocial-link--ig"><FiInstagram size={13} />@{user.instagram}</a>}
                                {user?.linkedin && <a href={user.linkedin.startsWith('http') ? user.linkedin : `https://linkedin.com/in/${user.linkedin}`} target="_blank" rel="noreferrer" className="psocial-link psocial-link--li"><FiLinkedin size={13} />LinkedIn</a>}
                            </div>
                        </div>

                        {/* Change avatar btn (top-right) */}
                        <button className="pchange-pic-btn" onClick={() => setAvatarPanel(p => p === 'closed' ? 'presets' : 'closed')}>
                            <FiCamera size={14} /> Change Photo
                        </button>
                    </div>

                    {/* Avatar picker panel */}
                    <AnimatePresence>
                        {avatarPanel !== 'closed' && (
                            <motion.div className="pavatar-panel" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                                <div className="pavatar-panel-tabs">
                                    <button className={`pavatar-tab ${avatarPanel === 'presets' ? 'active' : ''}`} onClick={() => setAvatarPanel('presets')}>🎨 Presets</button>
                                    <button className={`pavatar-tab ${avatarPanel === 'upload' ? 'active' : ''}`} onClick={() => setAvatarPanel('upload')}><FiUpload size={12} /> Upload</button>
                                    <button className="pavatar-close-btn" onClick={() => setAvatarPanel('closed')}><FiX /></button>
                                </div>
                                {avatarPanel === 'presets' && (
                                    <div className="pavatar-presets">
                                        {PRESETS.map((p, i) => (
                                            <button key={i} className="pavatar-preset-btn"
                                                style={{ background: `linear-gradient(135deg,${p.bg[0]},${p.bg[1]})` }}
                                                onClick={() => handlePresetClick(p)} disabled={!!busyPreset}>
                                                {busyPreset === p.emoji ? '⌛' : p.emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {avatarPanel === 'upload' && (
                                    <div className="pavatar-upload-zone" onClick={() => fileRef.current?.click()}>
                                        <FiCamera size={24} />
                                        <p>Click to choose a photo</p>
                                        <span>JPG, PNG, WebP — max 5 MB</span>
                                        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFileSelect} />
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ═══ FORMS ══════════════════════════════════════════════════ */}
                <div className="ppage-body">

                    {/* ── Personal Info ─────────────────────────────────────── */}
                    <section className="pcard">
                        <div className="pcard-hdr">
                            <FiUser className="pcard-hdr-icon" />
                            <div><h2>Personal Information</h2><p>Your name and public profile details</p></div>
                        </div>
                        <form onSubmit={handleSave} className="pform">
                            {/* Row 1 */}
                            <div className="pform-grid-2">
                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <div className="input-wrapper">
                                        <FiUser className="input-icon" />
                                        <input value={form.name} onChange={set('name')} className="form-input input-with-icon" required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email <span className="plabel-note">(read-only)</span></label>
                                    <div className="input-wrapper">
                                        <FiMail className="input-icon" />
                                        <input type="email" value={user?.email} className="form-input input-with-icon" disabled />
                                    </div>
                                </div>
                            </div>
                            {/* Row 2 */}
                            <div className="pform-grid-2">
                                <div className="form-group">
                                    <label className="form-label">Profession</label>
                                    <div className="input-wrapper">
                                        <FiBriefcase className="input-icon" />
                                        <input value={form.profession} onChange={set('profession')} className="form-input input-with-icon" placeholder="Doctor, Engineer, Student…" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">City / Location</label>
                                    <div className="input-wrapper">
                                        <FiMapPin className="input-icon" />
                                        <input value={form.city} onChange={set('city')} className="form-input input-with-icon" placeholder="Mumbai, Delhi…" />
                                    </div>
                                </div>
                            </div>
                            {/* Row 3 */}
                            <div className="pform-grid-2">
                                <div className="form-group">
                                    <label className="form-label">Date of Birth</label>
                                    <div className="input-wrapper">
                                        <FiCalendar className="input-icon" />
                                        <input type="date" value={form.dob} onChange={set('dob')} className="form-input input-with-icon" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Gender</label>
                                    <div className="pgender-row">
                                        {[['male', '♂ Male'], ['female', '♀ Female'], ['other', '⚧ Other'], ['prefer_not_to_say', '🤐 Prefer not to say']].map(([v, label]) => (
                                            <button key={v} type="button"
                                                className={`pgender-chip ${form.gender === v ? 'active' : ''}`}
                                                onClick={() => setForm(f => ({ ...f, gender: f.gender === v ? '' : v }))}>
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {/* Bio */}
                            <div className="form-group">
                                <label className="form-label">
                                    Bio <span className="plabel-note">{(form.bio || '').length}/500</span>
                                </label>
                                <textarea value={form.bio} onChange={set('bio')} className="form-input pbio-input"
                                    placeholder="Tell something about yourself…" maxLength={500} rows={3} />
                            </div>
                            {/* Social links */}
                            <div className="pcard-hdr" style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-md)', marginTop: 'var(--space-xs)' }}>
                                <FiGlobe className="pcard-hdr-icon" />
                                <div><h2>Social &amp; Links</h2><p>Optional — visible on your profile card</p></div>
                            </div>
                            <div className="pform-grid-2">
                                <div className="form-group">
                                    <label className="form-label">Website</label>
                                    <div className="input-wrapper">
                                        <FiGlobe className="input-icon" />
                                        <input value={form.website} onChange={set('website')} className="form-input input-with-icon" placeholder="https://yoursite.com" type="url" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Instagram username</label>
                                    <div className="input-wrapper">
                                        <FiInstagram className="input-icon" />
                                        <input value={form.instagram} onChange={set('instagram')} className="form-input input-with-icon" placeholder="username (no @)" />
                                    </div>
                                </div>
                            </div>
                            <div className="pform-grid-2">
                                <div className="form-group">
                                    <label className="form-label">LinkedIn</label>
                                    <div className="input-wrapper">
                                        <FiLinkedin className="input-icon" />
                                        <input value={form.linkedin} onChange={set('linkedin')} className="form-input input-with-icon" placeholder="yourname or full URL" />
                                    </div>
                                </div>
                            </div>

                            {/* Admin privacy toggle */}
                            <div className="pprivacy-box">
                                <div className="pprivacy-left">
                                    <FiInfo size={15} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
                                    <div>
                                        <p className="pprivacy-title">Share optional details with admin</p>
                                        <p className="pprivacy-sub">Profession, city, age, gender &amp; bio will be visible to admin</p>
                                    </div>
                                </div>
                                <div className={`ptoggle ${form.shareProfileWithAdmin ? 'on' : ''}`}
                                    onClick={() => setForm(f => ({ ...f, shareProfileWithAdmin: !f.shareProfileWithAdmin }))}>
                                    <div className="ptoggle-knob" />
                                </div>
                            </div>

                            <div className="pform-actions">
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    <FiSave /> {saving ? 'Saving…' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* ── Phone Number ──────────────────────────────────────── */}
                    <section className="pcard">
                        <div className="pcard-hdr">
                            <FiPhone className="pcard-hdr-icon" />
                            <div>
                                <h2>Phone Number</h2>
                                <p>Currently: <b style={{ color: 'var(--text-primary)' }}>{user?.phone || 'Not set'}</b></p>
                            </div>
                        </div>

                        {phoneStep === 'idle' && (
                            <button className="btn btn-outline pphone-btn" onClick={() => setPhoneStep('request')}>
                                <FiEdit2 size={14} /> {user?.phone ? 'Change Number' : 'Add Number'}
                            </button>
                        )}

                        {phoneStep === 'request' && (
                            <form onSubmit={handleRequestPhone} className="pform">
                                <div className="form-group">
                                    <label className="form-label">New Mobile Number</label>
                                    <div className="input-wrapper">
                                        <span className="pphone-prefix">+91</span>
                                        <input type="tel" value={newPhone}
                                            onChange={e => setNewPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="form-input pphone-input"
                                            placeholder="98765 43210" maxLength={10} required />
                                    </div>
                                    <p className="pfield-hint">Enter 10-digit mobile number — OTP will be sent to verify</p>
                                </div>
                                <div className="pform-actions">
                                    <button type="button" className="btn btn-glass" onClick={() => { setPhoneStep('idle'); setNewPhone(''); }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={phoneLoading || newPhone.length !== 10}>
                                        {phoneLoading ? 'Sending…' : 'Send OTP →'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {phoneStep === 'verify' && (
                            <form onSubmit={handleVerifyPhone} className="pform">
                                <div className="form-group">
                                    <label className="form-label">6-digit OTP sent to +91 {newPhone}</label>
                                    <input type="text" value={phoneOtp}
                                        onChange={e => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="form-input potp-input" placeholder="• • • • • •" maxLength={6} required />
                                </div>
                                <div className="pform-actions">
                                    <button type="button" className="btn btn-glass" onClick={() => setPhoneStep('request')}>
                                        <FiRefreshCw size={13} /> Resend
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={phoneLoading || phoneOtp.length !== 6}>
                                        {phoneLoading ? 'Verifying…' : '✓ Verify & Update'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>

                    {/* ── Addresses ────────────────────────────────────────── */}
                    <section className="pcard">
                        <div className="pcard-hdr">
                            <FiMapPin className="pcard-hdr-icon" />
                            <div><h2>Manage Addresses</h2><p>Your saved delivery locations</p></div>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowAddrForm(!showAddrForm)}>
                                {showAddrForm ? <FiX /> : <FiEdit2 />} {showAddrForm ? 'Cancel' : 'Add New'}
                            </button>
                        </div>

                        {showAddrForm && (
                            <form onSubmit={handleAddrSave} className="pform" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)' }}>
                                <div className="pform-grid-2">
                                    <input placeholder="Full Name" className="form-input" value={addrForm.fullName} onChange={e => setAddrForm({ ...addrForm, fullName: e.target.value })} required />
                                    <input placeholder="Phone" className="form-input" value={addrForm.phone} onChange={e => setAddrForm({ ...addrForm, phone: e.target.value })} required />
                                </div>
                                <input placeholder="Street Address" className="form-input" style={{ width: '100%', marginTop: '8px' }} value={addrForm.street} onChange={e => setAddrForm({ ...addrForm, street: e.target.value })} required />
                                <div className="pform-grid-2" style={{ marginTop: '8px' }}>
                                    <input placeholder="City" className="form-input" value={addrForm.city} onChange={e => setAddrForm({ ...addrForm, city: e.target.value })} required />
                                    <input placeholder="State" className="form-input" value={addrForm.state} onChange={e => setAddrForm({ ...addrForm, state: e.target.value })} required />
                                </div>
                                <div className="pform-grid-2" style={{ marginTop: '8px' }}>
                                    <input placeholder="Pincode" className="form-input" value={addrForm.pincode} onChange={e => setAddrForm({ ...addrForm, pincode: e.target.value })} required />
                                    <label className="flex gap-sm" style={{ alignItems: 'center', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={addrForm.isDefault} onChange={e => setAddrForm({ ...addrForm, isDefault: e.target.checked })} />
                                        Set as default
                                    </label>
                                </div>
                                <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} disabled={addrLoading}>Save Address</button>
                            </form>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                            {addresses.map(addr => (
                                <div key={addr._id} className="glass-card" style={{ padding: 'var(--space-md)', position: 'relative', border: addr.isDefault ? '1px solid var(--gold)' : '1px solid var(--border)' }}>
                                    {addr.isDefault && <span style={{ position: 'absolute', top: 8, right: 8, fontSize: '0.65rem', color: 'var(--gold)', fontWeight: 700 }}>DEFAULT</span>}
                                    <div style={{ fontWeight: 600 }}>{addr.fullName}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                                        {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{addr.phone}</div>
                                    <div className="flex gap-sm" style={{ marginTop: 12 }}>
                                        {!addr.isDefault && <button className="btn btn-glass btn-xs" onClick={() => handleSetDefault(addr._id)}>Set Default</button>}
                                        <button className="btn btn-glass btn-xs" style={{ color: 'var(--error)' }} onClick={() => handleAddrDelete(addr._id)}>Delete</button>
                                    </div>
                                </div>
                            ))}
                            {addresses.length === 0 && !addrLoading && <p className="text-muted">No addresses saved yet.</p>}
                        </div>
                    </section>

                </div>
            </div>
        </>
    );
};

export default Profile;
