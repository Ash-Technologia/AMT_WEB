import { Helmet } from 'react-helmet-async';

const PrivacyPolicy = () => (
    <>
        <Helmet><title>Privacy Policy — AMT</title></Helmet>
        <div className="container" style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-3xl)', maxWidth: 800 }}>
            <h1 style={{ marginBottom: 'var(--space-xl)' }}>Privacy Policy</h1>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.9, display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <section>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>Information We Collect</h2>
                    <p>We collect information you provide directly to us, such as your name, email address, phone number, and shipping address when you create an account or place an order.</p>
                </section>
                <section>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>How We Use Your Information</h2>
                    <p>We use the information we collect to process orders, send order confirmations and updates, respond to your inquiries, and send promotional communications (with your consent).</p>
                </section>
                <section>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>Data Security</h2>
                    <p>We implement appropriate security measures to protect your personal information. All payment transactions are processed through Razorpay's secure payment gateway.</p>
                </section>
                <section>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>Contact Us</h2>
                    <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:amrutsinghavi@gmail.com" style={{ color: 'var(--primary-light)' }}>amrutsinghavi@gmail.com</a>.</p>
                </section>
            </div>
        </div>
    </>
);

export default PrivacyPolicy;
