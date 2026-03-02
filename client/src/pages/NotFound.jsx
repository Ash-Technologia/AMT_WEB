import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const NotFound = () => (
    <>
        <Helmet><title>404 — Page Not Found | AMT</title></Helmet>
        <div className="flex-center flex-col" style={{ minHeight: '80vh', gap: 'var(--space-lg)', textAlign: 'center', padding: 'var(--space-xl)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                <div style={{ fontSize: '6rem', marginBottom: 'var(--space-md)', animation: 'float 3s ease-in-out infinite' }}>🌿</div>
                <h1 style={{ fontSize: 'clamp(4rem, 10vw, 8rem)', fontFamily: 'Playfair Display, serif', background: 'linear-gradient(135deg, var(--primary-light), var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>404</h1>
                <h2 style={{ marginBottom: 'var(--space-md)' }}>Page Not Found</h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto var(--space-xl)' }}>
                    The page you're looking for seems to have wandered off into the wellness wilderness.
                </p>
                <div className="flex gap-md" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/" className="btn btn-primary btn-lg">Go Home</Link>
                    <Link to="/products" className="btn btn-glass btn-lg">Shop Products</Link>
                </div>
            </motion.div>
        </div>
    </>
);

export default NotFound;
