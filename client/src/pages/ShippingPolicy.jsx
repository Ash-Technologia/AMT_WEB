import { Helmet } from 'react-helmet-async';

const ShippingPolicy = () => (
    <>
        <Helmet><title>Shipping Policy — AMT</title></Helmet>
        <div className="container" style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-3xl)', maxWidth: 800 }}>
            <h1 style={{ marginBottom: 'var(--space-xl)' }}>Shipping Policy</h1>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.9, display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <section>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>Delivery Areas</h2>
                    <p>We deliver across India. Delivery times may vary based on your location.</p>
                </section>
                <section>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>Shipping Charges</h2>
                    <p>Standard shipping is ₹60 for orders below ₹999. Orders above ₹999 qualify for FREE shipping.</p>
                </section>
                <section>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>Delivery Timeline</h2>
                    <p>Orders are typically delivered within 5-7 business days. Express delivery options may be available at checkout.</p>
                </section>
                <section>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>Order Tracking</h2>
                    <p>Once your order is shipped, you will receive a tracking number via email to monitor your delivery.</p>
                </section>
            </div>
        </div>
    </>
);

export default ShippingPolicy;
