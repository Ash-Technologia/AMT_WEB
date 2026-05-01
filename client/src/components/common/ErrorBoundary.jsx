import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // In production, send to error reporting (Sentry etc.)
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--background, #0a0a0a)',
                    color: 'var(--text-primary, #fff)',
                    padding: '2rem',
                    textAlign: 'center',
                    fontFamily: 'Inter, sans-serif',
                }}>
                    <div style={{
                        fontSize: '4rem',
                        marginBottom: '1rem',
                        animation: 'pulse 2s infinite',
                    }}>⚕️</div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontFamily: 'Playfair Display, serif',
                        marginBottom: '1rem',
                        color: '#C9A84C',
                    }}>
                        Something went wrong
                    </h1>
                    <p style={{
                        color: 'rgba(255,255,255,0.6)',
                        maxWidth: 480,
                        lineHeight: 1.7,
                        marginBottom: '2rem',
                    }}>
                        We encountered an unexpected issue. Our team has been notified. 
                        Please refresh the page or contact us if the problem persists.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '0.875rem 2rem',
                                background: 'linear-gradient(135deg, #C9A84C, #e4c068)',
                                color: '#000',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                            }}
                        >
                            Refresh Page
                        </button>
                        <button
                            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
                            style={{
                                padding: '0.875rem 2rem',
                                background: 'transparent',
                                color: 'rgba(255,255,255,0.7)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            Go Home
                        </button>
                    </div>
                    {process.env.NODE_ENV !== 'production' && this.state.error && (
                        <details style={{
                            marginTop: '2rem',
                            padding: '1rem',
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: '8px',
                            maxWidth: 600,
                            textAlign: 'left',
                            color: '#f87171',
                            fontSize: '0.8rem',
                        }}>
                            <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>Error Details (dev only)</summary>
                            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {this.state.error.toString()}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
