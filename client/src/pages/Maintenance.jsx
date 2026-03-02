import { useNavigate } from 'react-router-dom';
import { FiLock, FiSettings } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';

const Maintenance = () => {
    const navigate = useNavigate();

    return (
        <>
            <Helmet><title>Site Maintenance — AMT</title></Helmet>
            <div style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#050806',
                color: '#F0F4F1',
                padding: '2rem',
                textAlign: 'center'
            }}>
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '3rem',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    maxWidth: '500px',
                    width: '100%'
                }}>
                    <FiLock style={{ fontSize: '4rem', color: '#C9A84C', marginBottom: '1.5rem' }} />
                    <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', marginBottom: '1rem' }}>Private Access Only</h1>
                    <p style={{ color: '#A8C5B5', lineHeight: '1.6', marginBottom: '2rem' }}>
                        The AMT Store is currently in private mode for maintenance or updates.
                        Please check back later or log in if you are an administrator.
                    </p>

                    <button
                        onClick={() => navigate('/login')}
                        className="btn btn-primary"
                        style={{ padding: '12px 32px' }}
                    >
                        Admin Login
                    </button>
                </div>
            </div>
        </>
    );
};

export default Maintenance;
