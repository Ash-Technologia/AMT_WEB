import { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../services/api';
import { MandalaBackdrop, SilkFlow, LotusBloom, OrnamentalDivider } from '../components/ui/Decorations';

const Contact = () => {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await API.post('/contact', form);
            toast.success('Message sent! We\'ll get back to you within 24 hours.');
            setForm({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            toast.error('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet><title>Contact Us — AMT Advanced Medical Therapeutics</title></Helmet>
            <div className="container" style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-3xl)', position: 'relative' }}>
                {/* Luxury Background Elements */}
                <MandalaBackdrop style={{ position: 'absolute', top: '2%', right: '-15%', width: '500px', color: 'var(--primary-light)', opacity: 0.08 }} />
                <SilkFlow style={{ position: 'absolute', bottom: '10%', left: '-5%', width: '110%', color: 'var(--gold)', opacity: 0.08 }} />
                <LotusBloom style={{ position: 'absolute', top: '15%', left: '5%', width: '140px', color: 'var(--primary-light)', opacity: 0.1 }} />
                <LotusBloom style={{ position: 'absolute', bottom: '20%', right: '10%', width: '100px', color: 'var(--gold)', opacity: 0.1 }} />

                <div className="section-header">
                    <span className="section-label">Get in Touch</span>
                    <h1 className="section-title">Contact Us</h1>
                    <div className="divider" />
                    <p className="section-subtitle">We'd love to hear from you. Send us a message!</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 'var(--space-2xl)', alignItems: 'start' }}>
                    {/* Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {[
                            { icon: <FiMail />, label: 'Email', value: 'amrutsinghavi@gmail.com', href: 'mailto:amrutsinghavi@gmail.com' },
                            { icon: <FiPhone />, label: 'Phone', value: '+91 98228 43015', href: 'tel:+919822843015' },
                            { icon: <FiMapPin />, label: 'Location', value: 'India', href: null },
                        ].map(item => (
                            <motion.div
                                key={item.label}
                                className="glass-card"
                                style={{ padding: 'var(--space-lg)', display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, rgba(45,106,79,0.2), rgba(82,183,136,0.1))', border: '1px solid rgba(45,106,79,0.3)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)', fontSize: '1.2rem', flexShrink: 0 }}>
                                    {item.icon}
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</p>
                                    {item.href ? (
                                        <a href={item.href} style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.value}</a>
                                    ) : (
                                        <p style={{ fontWeight: 500 }}>{item.value}</p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Form */}
                    <motion.div className="glass-card" style={{ padding: 'var(--space-xl)' }} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            <div className="grid-2" style={{ gap: 'var(--space-md)' }}>
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="form-input" placeholder="Your name" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="form-input" placeholder="your@email.com" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Subject</label>
                                <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="form-input" placeholder="How can we help?" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Message</label>
                                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="form-input" placeholder="Tell us more..." rows={5} required />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                <FiSend /> {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </motion.div>
                </div>

                <OrnamentalDivider style={{ marginTop: 'var(--space-3xl)' }} />
            </div>
        </>
    );
};

export default Contact;
