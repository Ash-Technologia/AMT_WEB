import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiSend, FiTrash2 } from 'react-icons/fi';
import API from '../../services/api';
import toast from 'react-hot-toast';

const AdminNewsletter = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [campaign, setCampaign] = useState({ subject: '', body: '' });
    const [sending, setSending] = useState(false);

    useEffect(() => {
        API.get('/newsletter/subscribers').then(res => setSubscribers(res.data.subscribers || [])).catch(console.error).finally(() => setLoading(false));
    }, []);

    const sendCampaign = async (e) => {
        e.preventDefault();
        if (!confirm(`Send newsletter to ${subscribers.length} subscribers?`)) return;
        try {
            setSending(true);
            await API.post('/newsletter/send', campaign);
            toast.success('Newsletter sent!');
            setCampaign({ subject: '', body: '' });
        } catch (err) {
            toast.error('Failed to send newsletter');
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            <Helmet><title>Newsletter — AMT Admin</title></Helmet>
            <div>
                <div className="admin-page-header">
                    <h1 className="admin-page-title">Newsletter</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{subscribers.length} subscribers</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
                    <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
                        <h3 style={{ marginBottom: 'var(--space-lg)' }}>Send Campaign</h3>
                        <form onSubmit={sendCampaign} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            <div className="form-group">
                                <label className="form-label">Subject</label>
                                <input value={campaign.subject} onChange={e => setCampaign(c => ({ ...c, subject: e.target.value }))} className="form-input" placeholder="Email subject" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Body</label>
                                <textarea value={campaign.body} onChange={e => setCampaign(c => ({ ...c, body: e.target.value }))} className="form-input" rows={8} placeholder="Email content..." required />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={sending}><FiSend /> {sending ? 'Sending...' : `Send to ${subscribers.length} subscribers`}</button>
                        </form>
                    </div>
                    <div className="glass-card" style={{ padding: 'var(--space-xl)', maxHeight: 500, overflow: 'auto' }}>
                        <h3 style={{ marginBottom: 'var(--space-lg)' }}>Subscribers</h3>
                        {loading ? <p>Loading...</p> : subscribers.map(sub => (
                            <div key={sub._id} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                                <span>{sub.email}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(sub.createdAt).toLocaleDateString('en-IN')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminNewsletter;
