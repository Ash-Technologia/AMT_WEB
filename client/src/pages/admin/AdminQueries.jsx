import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiMessageSquare, FiSend, FiTrash } from 'react-icons/fi';
import API from '../../services/api';
import toast from 'react-hot-toast';

const AdminQueries = () => {
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyModal, setReplyModal] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        API.get('/contact/').then(res => setQueries(res.data.queries || [])).catch(console.error).finally(() => setLoading(false));
    }, []);

    const sendReply = async () => {
        if (!replyText.trim()) return;
        try {
            setSending(true);
            await API.post(`/contact/${replyModal._id}/reply`, { replyMessage: replyText });
            toast.success('Reply sent!');
            setReplyModal(null);
            setReplyText('');
            setQueries(prev => prev.map(q => q._id === replyModal._id ? { ...q, replied: true } : q));
        } catch (err) {
            toast.error('Failed to send reply');
        } finally {
            setSending(false);
        }
    };

    const deleteQuery = async (id) => {
        if (!window.confirm('Are you sure you want to delete this query?')) return;
        try {
            await API.delete(`/contact/${id}`);
            toast.success('Query deleted');
            setQueries(prev => prev.filter(q => q._id !== id));
        } catch (err) {
            toast.error('Failed to delete query');
        }
    };

    return (
        <>
            <Helmet><title>Contact Queries — AMT Admin</title></Helmet>
            {replyModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-lg)' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: 560, padding: 'var(--space-xl)' }}>
                        <h3 style={{ marginBottom: 'var(--space-md)' }}>Reply to {replyModal.name}</h3>
                        <div style={{ background: 'var(--surface)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <strong>Subject:</strong> {replyModal.subject}<br />
                            <strong>Message:</strong> {replyModal.message}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Your Reply</label>
                            <textarea value={replyText} onChange={e => setReplyText(e.target.value)} className="form-input" rows={5} placeholder="Type your reply..." />
                        </div>
                        <div className="flex gap-md">
                            <button className="btn btn-primary" onClick={sendReply} disabled={sending}><FiSend /> {sending ? 'Sending...' : 'Send Reply'}</button>
                            <button className="btn btn-glass" onClick={() => setReplyModal(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            <div>
                <div className="admin-page-header">
                    <h1 className="admin-page-title">Contact Queries</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{queries.filter(q => !q.replied).length} unread</p>
                </div>
                <div className="glass-card admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr><th>Name</th><th>Email</th><th>Subject</th><th>Date</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>Loading...</td></tr>
                            ) : queries.map(query => (
                                <tr key={query._id}>
                                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{query.name}</td>
                                    <td>{query.email}</td>
                                    <td style={{ maxWidth: 200 }}>{query.subject}</td>
                                    <td style={{ fontSize: '0.8rem' }}>{new Date(query.createdAt).toLocaleDateString('en-IN')}</td>
                                    <td><span style={{ color: query.replied ? 'var(--success)' : 'var(--warning)' }}>{query.replied ? '✓ Replied' : '● Pending'}</span></td>
                                    <td>
                                        <div className="flex gap-sm">
                                            <button onClick={() => { setReplyModal(query); setReplyText(''); }} className="icon-btn" style={{ color: 'var(--primary-light)' }} title="Reply">
                                                <FiMessageSquare />
                                            </button>
                                            <button onClick={() => deleteQuery(query._id)} className="icon-btn" style={{ color: 'var(--error)' }} title="Delete">
                                                <FiTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default AdminQueries;
