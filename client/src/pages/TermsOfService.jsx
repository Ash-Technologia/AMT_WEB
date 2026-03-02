import { Helmet } from 'react-helmet-async';

const TermsOfService = () => (
    <>
        <Helmet><title>Terms of Service — AMT</title></Helmet>
        <div className="container" style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-3xl)', maxWidth: 800 }}>
            <h1 style={{ marginBottom: 'var(--space-xl)' }}>Terms of Service</h1>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.9, display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <section>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>Acceptance of Terms</h2>
                    <p>By accessing and using AMT's website and services, you accept and agree to be bound by these Terms of Service.</p>
                </section>
                <section>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>Products & Orders</h2>
                    <p>All products are subject to availability. We reserve the right to limit quantities. Prices are subject to change without notice.</p>
                </section>
                <section>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>Returns & Refunds</h2>
                    <p>We accept returns within 7 days of delivery for unused products in original packaging. Refunds are processed within 5-7 business days after receiving the returned item.</p>
                </section>
                <section>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>Limitation of Liability</h2>
                    <p>AMT products are intended for therapeutic use only and are not a substitute for professional medical advice. Always consult a healthcare professional before use.</p>
                </section>
            </div>
        </div>
    </>
);

export default TermsOfService;
