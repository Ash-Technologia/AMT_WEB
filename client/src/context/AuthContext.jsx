import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useSocket } from './SocketContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('amt_user');
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });
    const [loading, setLoading] = useState(true);
    const { connect, disconnect } = useSocket();

    // Verify token on mount and connect socket
    useEffect(() => {
        const token = localStorage.getItem('amt_token');
        if (token) {
            API.get('/auth/me')
                .then(res => {
                    setUser(res.data.user);
                    connect(token); // connect socket
                })
                .catch(() => { localStorage.removeItem('amt_token'); localStorage.removeItem('amt_user'); setUser(null); })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('amt_token', token);
        localStorage.setItem('amt_user', JSON.stringify(userData));
        setUser(userData);
        connect(token); // connect socket on login
    };

    const logout = () => {
        localStorage.removeItem('amt_token');
        localStorage.removeItem('amt_user');
        setUser(null);
        disconnect(); // disconnect socket on logout
    };

    const updateUser = (userData) => {
        localStorage.setItem('amt_user', JSON.stringify(userData));
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAdmin: user?.role === 'admin' }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
