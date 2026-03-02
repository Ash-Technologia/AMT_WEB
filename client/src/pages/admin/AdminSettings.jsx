import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiSave } from 'react-icons/fi';
import API from '../../services/api';
import toast from 'react-hot-toast';

const AdminSettings = () => {
    const [settings, setSettings] = useState({ deliveryCharge: 60, freeDeliveryThreshold: 999, estimatedDeliveryDays: '5-7', maintenanceMode: false });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        API.get('/admin/settings').then(res => {
            if (res.data.settings) setSettings(res.data.settings);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await API.put('/admin/settings', settings);
            toast.success('Settings saved!');
        } catch (err) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Helmet><title>Settings — AMT Admin</title></Helmet>
            <div>
                <div className="admin-page-header">
                    <h1 className="admin-page-title">Site Settings</h1>
                </div>
                <div className="glass-card" style={{ padding: 'var(--space-xl)', maxWidth: 600 }}>
                    <h3 style={{ marginBottom: 'var(--space-lg)' }}>Site Configuration</h3>
                    {loading ? <p>Loading...</p> : (
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

                            {/* Maintenance Mode Toggle */}
                            <div className="glass-card" style={{ padding: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: settings.maintenanceMode ? '1px solid var(--warning)' : '1px solid var(--border)' }}>
                                <div>
                                    <h4 style={{ margin: 0, color: settings.maintenanceMode ? 'var(--warning)' : 'var(--text-primary)' }}>
                                        {settings.maintenanceMode ? '🔒 Maintenance Mode Active' : '🌐 Site is Public'}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {settings.maintenanceMode ? 'Only admins can access the site.' : 'Anyone can visit the store.'}
                                    </p>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.maintenanceMode || false}
                                        onChange={e => setSettings(s => ({ ...s, maintenanceMode: e.target.checked }))}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            <h3 style={{ margin: 'var(--space-lg) 0 var(--space-md)' }}>Homepage Configuration</h3>
                            <div className="glass-card" style={{ padding: 'var(--space-md)', border: '1px solid var(--border)' }}>
                                <div className="form-group">
                                    <label className="form-label">Watch & Learn Video URL (YouTube)</label>
                                    <input
                                        type="text"
                                        value={settings.homepageVideoUrl || ''}
                                        onChange={e => setSettings(s => ({ ...s, homepageVideoUrl: e.target.value }))}
                                        className="form-input"
                                        placeholder="e.g. https://www.youtube.com/watch?v=FmXREvYq3kE"
                                    />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                        Enter the full YouTube URL. This video will appear in the "Watch & Learn" section.
                                    </p>
                                </div>
                                {settings.homepageVideoUrl && (
                                    <div style={{ marginTop: 'var(--space-sm)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)', background: '#000', aspectRatio: '16/9' }}>
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={settings.homepageVideoUrl.includes('v=')
                                                ? `https://www.youtube.com/embed/${settings.homepageVideoUrl.split('v=')[1]?.split('&')[0]}`
                                                : `https://www.youtube.com/embed/${settings.homepageVideoUrl.split('/').pop()}`}
                                            title="Preview"
                                            frameBorder="0"
                                            allowFullScreen
                                        />
                                    </div>
                                )}
                            </div>

                            <h3 style={{ margin: 'var(--space-lg) 0 var(--space-md)' }}>Shipping & Delivery</h3>
                            <div className="form-group">
                                <label className="form-label">Standard Delivery Charge (₹)</label>
                                <input type="number" value={settings.deliveryCharge} onChange={e => setSettings(s => ({ ...s, deliveryCharge: e.target.value }))} className="form-input" min={0} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Free Delivery Threshold (₹)</label>
                                <input type="number" value={settings.freeDeliveryThreshold} onChange={e => setSettings(s => ({ ...s, freeDeliveryThreshold: e.target.value }))} className="form-input" min={0} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Estimated Delivery Days</label>
                                <input type="text" value={settings.estimatedDeliveryDays} onChange={e => setSettings(s => ({ ...s, estimatedDeliveryDays: e.target.value }))} className="form-input" placeholder="e.g. 5-7" />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={saving}>
                                <FiSave /> {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </form>
                    )}
                </div>
            </div >
        </>
    );
};

export default AdminSettings;
