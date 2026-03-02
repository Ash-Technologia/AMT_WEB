import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import API from '../../services/api';
import toast from 'react-hot-toast';
import AdminBulkActions from '../../components/admin/AdminBulkActions';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', price: '', discountPrice: '', stock: '', category: '', tags: '', howToUse: '', instructions: '', videoUrl: '' });
    const [imageFiles, setImageFiles] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const toggleSelect = (id) => setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    const toggleAll = () => setSelectedIds(prev =>
        prev.length === products.length ? [] : products.map(p => p._id)
    );

    const fetchProducts = () => {
        setLoading(true);
        API.get('/products?limit=100').then(res => setProducts(res.data.products || [])).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { fetchProducts(); }, []);

    const openForm = (product = null) => {
        if (product) {
            setForm({ name: product.name, description: product.description, price: product.price, discountPrice: product.discountPrice || '', stock: product.stock, category: product.category || '', tags: product.tags?.join(', ') || '', howToUse: product.howToUse || '', instructions: product.instructions || '', videoUrl: product.videoUrl || '' });
            setEditProduct(product);
        } else {
            setForm({ name: '', description: '', price: '', discountPrice: '', stock: '', category: '', tags: '', howToUse: '', instructions: '', videoUrl: '' });
            setEditProduct(null);
        }
        setImageFiles([]);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            imageFiles.forEach(f => formData.append('images', f));

            if (editProduct) {
                await API.put(`/products/${editProduct._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Product updated!');
            } else {
                await API.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Product created!');
            }
            setShowForm(false);
            fetchProducts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save product');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this product?')) return;
        try {
            await API.delete(`/products/${id}`);
            toast.success('Product deleted');
            fetchProducts();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const toggleVisibility = async (product) => {
        try {
            await API.patch(`/products/${product._id}/visibility`);
            fetchProducts();
        } catch (err) {
            toast.error('Failed to toggle visibility');
        }
    };

    return (
        <>
            <Helmet><title>Products — AMT Admin</title></Helmet>
            <div>
                <div className="admin-page-header">
                    <h1 className="admin-page-title">Products</h1>
                    <button className="btn btn-primary" onClick={() => openForm()}>
                        <FiPlus /> Add Product
                    </button>
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-lg)' }}>
                        <div className="glass-card" style={{ width: '100%', maxWidth: 700, maxHeight: '90vh', overflow: 'auto', padding: 'var(--space-xl)' }}>
                            <h3 style={{ marginBottom: 'var(--space-lg)' }}>{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                <div className="grid-2" style={{ gap: 'var(--space-md)' }}>
                                    <div className="form-group">
                                        <label className="form-label">Product Name *</label>
                                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="form-input" required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Category</label>
                                        <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="form-input" placeholder="e.g. Pain Relief" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Price (₹) *</label>
                                        <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="form-input" required min={0} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Discount Price (₹)</label>
                                        <input type="number" value={form.discountPrice} onChange={e => setForm(f => ({ ...f, discountPrice: e.target.value }))} className="form-input" min={0} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Stock *</label>
                                        <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="form-input" required min={0} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Tags (comma separated)</label>
                                        <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="form-input" placeholder="pain, therapy, natural" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">YouTube Video URL</label>
                                        <input value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} className="form-input" placeholder="https://www.youtube.com/watch?v=..." />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description *</label>
                                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="form-input" rows={4} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">How to Use</label>
                                    <textarea value={form.howToUse} onChange={e => setForm(f => ({ ...f, howToUse: e.target.value }))} className="form-input" rows={3} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Instructions / Warnings</label>
                                    <textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} className="form-input" rows={2} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Product Images</label>
                                    <input type="file" accept="image/*" multiple onChange={e => setImageFiles(Array.from(e.target.files))} className="form-input" />
                                    {imageFiles.length > 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{imageFiles.length} file(s) selected</p>}
                                </div>
                                <div className="flex gap-md">
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Product'}</button>
                                    <button type="button" className="btn btn-glass" onClick={() => setShowForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="glass-card admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: 36 }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === products.length && products.length > 0}
                                        onChange={toggleAll}
                                        style={{ accentColor: 'var(--primary)' }}
                                    />
                                </th>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Rating</th>
                                <th>Visible</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>Loading...</td></tr>
                            ) : products.map(product => (
                                <tr key={product._id} style={{ background: selectedIds.includes(product._id) ? 'rgba(82,183,136,0.06)' : undefined }}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(product._id)}
                                            onChange={() => toggleSelect(product._id)}
                                            style={{ accentColor: 'var(--primary)' }}
                                        />
                                    </td>
                                    <td>
                                        <img src={product.images?.[0]?.url} alt={product.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                                    </td>
                                    <td style={{ fontWeight: 500, color: 'var(--text-primary)', maxWidth: 200 }}>{product.name}</td>
                                    <td>
                                        <div>₹{(product.discountPrice || product.price).toLocaleString('en-IN')}</div>
                                        {product.discountPrice && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{product.price.toLocaleString('en-IN')}</div>}
                                    </td>
                                    <td>
                                        <span style={{ color: product.stock === 0 ? 'var(--error)' : product.stock < 10 ? 'var(--warning)' : 'var(--success)' }}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td>{product.avgRating > 0 ? `⭐ ${product.avgRating.toFixed(1)}` : '—'}</td>
                                    <td>
                                        <button onClick={() => toggleVisibility(product)} className="icon-btn" style={{ color: product.isVisible ? 'var(--success)' : 'var(--text-muted)' }}>
                                            {product.isVisible ? <FiEye /> : <FiEyeOff />}
                                        </button>
                                    </td>
                                    <td>
                                        <div className="flex gap-sm">
                                            <button onClick={() => openForm(product)} className="icon-btn" style={{ color: 'var(--primary-light)' }}><FiEdit2 /></button>
                                            <button onClick={() => handleDelete(product._id)} className="icon-btn" style={{ color: 'var(--error)' }}><FiTrash2 /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bulk Actions Floating Bar */}
            <AdminBulkActions
                selectedIds={selectedIds}
                onClose={() => setSelectedIds([])}
                onDone={fetchProducts}
            />
        </>
    );
};

export default AdminProducts;
