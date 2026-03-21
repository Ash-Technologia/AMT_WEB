import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import API from '../../services/api';
import toast from 'react-hot-toast';

const AdminBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editBlog, setEditBlog] = useState(null);
    const [form, setForm] = useState({ title: '', content: '', excerpt: '', tags: '', isPublished: true });
    const [coverFile, setCoverFile] = useState(null);
    const [existingCover, setExistingCover] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchBlogs = () => {
        setLoading(true);
        API.get('/blogs/admin/all').then(res => setBlogs(res.data.blogs || [])).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { fetchBlogs(); }, []);

    const openForm = (blog = null) => {
        if (blog) {
            setForm({ title: blog.title, content: blog.content, excerpt: blog.excerpt || '', tags: blog.tags?.join(', ') || '', isPublished: blog.isPublished });
            setExistingCover(blog.coverImage || null);
            setEditBlog(blog);
        } else {
            setForm({ title: '', content: '', excerpt: '', tags: '', isPublished: true });
            setExistingCover(null);
            setEditBlog(null);
        }
        setCoverFile(null);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            if (coverFile) formData.append('coverImage', coverFile);
            if (!existingCover && editBlog && editBlog.coverImage) formData.append('removeCover', 'true');

            if (editBlog) {
                await API.put(`/blogs/${editBlog._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Blog updated!');
            } else {
                await API.post('/blogs', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Blog created!');
            }
            setShowForm(false);
            fetchBlogs();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save blog');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this blog?')) return;
        try {
            await API.delete(`/blogs/${id}`);
            toast.success('Blog deleted');
            fetchBlogs();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    return (
        <>
            <Helmet><title>Blogs — AMT Admin</title></Helmet>
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-lg)' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: 700, maxHeight: '90vh', overflow: 'auto', padding: 'var(--space-xl)' }}>
                        <h3 style={{ marginBottom: 'var(--space-lg)' }}>{editBlog ? 'Edit Blog' : 'New Blog Post'}</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Excerpt</label>
                                <input value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} className="form-input" placeholder="Short summary for listing" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Content *</label>
                                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="form-input" rows={10} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tags (comma separated)</label>
                                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="form-input" placeholder="health, therapy, wellness" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Cover Image</label>
                                <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files[0])} className="form-input" />
                                {existingCover && !coverFile && (
                                    <div style={{ position: 'relative', marginTop: '10px', display: 'inline-block' }}>
                                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Existing Cover:</label>
                                        <div style={{ position: 'relative', display: 'inline-block' }}>
                                            <img src={existingCover.url} alt="Cover" style={{ width: 120, height: 75, objectFit: 'contain', borderRadius: '4px', border: '1px solid var(--border)' }} />
                                            <button type="button" onClick={() => setExistingCover(null)} style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', width: 20, height: 20, fontSize: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remove existing cover">✕</button>
                                        </div>
                                    </div>
                                )}
                                {coverFile && <p style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '4px' }}>1 new file selected</p>}
                            </div>
                            <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                                <input type="checkbox" id="isPublished" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} />
                                <label htmlFor="isPublished" className="form-label" style={{ marginBottom: 0 }}>Publish immediately</label>
                            </div>
                            <div className="flex gap-md">
                                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Blog'}</button>
                                <button type="button" className="btn btn-glass" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <div>
                <div className="admin-page-header">
                    <h1 className="admin-page-title">Blogs</h1>
                    <button className="btn btn-primary" onClick={() => openForm()}><FiPlus /> New Post</button>
                </div>
                <div className="glass-card admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr><th>Title</th><th>Tags</th><th>Status</th><th>Views</th><th>Date</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>Loading...</td></tr>
                            ) : blogs.map(blog => (
                                <tr key={blog._id}>
                                    <td style={{ fontWeight: 500, color: 'var(--text-primary)', maxWidth: 250 }}>{blog.title}</td>
                                    <td style={{ maxWidth: 150 }}>
                                        <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                                            {blog.tags?.slice(0, 2).map(t => <span key={t} className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{t}</span>)}
                                        </div>
                                    </td>
                                    <td><span style={{ color: blog.isPublished ? 'var(--success)' : 'var(--warning)' }}>{blog.isPublished ? '● Published' : '● Draft'}</span></td>
                                    <td>{blog.viewCount || 0}</td>
                                    <td style={{ fontSize: '0.8rem' }}>{new Date(blog.createdAt).toLocaleDateString('en-IN')}</td>
                                    <td>
                                        <div className="flex gap-sm">
                                            <button onClick={() => openForm(blog)} className="icon-btn" style={{ color: 'var(--primary-light)' }}><FiEdit2 /></button>
                                            <button onClick={() => handleDelete(blog._id)} className="icon-btn" style={{ color: 'var(--error)' }}><FiTrash2 /></button>
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

export default AdminBlogs;
