import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.MODE === 'production'
    ? window.location.origin
    : 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);

    const connect = (token) => {
        if (socketRef.current?.connected) return;

        socketRef.current = io(SOCKET_URL, {
            auth: { token },
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ['websocket', 'polling'],
        });

        socketRef.current.on('connect', () => {
            console.log('🔌 Socket connected:', socketRef.current.id);
            setConnected(true);
        });

        socketRef.current.on('disconnect', () => {
            console.log('🔌 Socket disconnected');
            setConnected(false);
        });

        socketRef.current.on('connect_error', (err) => {
            console.warn('Socket connect error:', err.message);
        });
    };

    const disconnect = () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            setConnected(false);
        }
    };

    useEffect(() => {
        return () => disconnect();
    }, []);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, connected, connect, disconnect }}>
            {children}
        </SocketContext.Provider>
    );
};

// Return a safe no-op fallback when used outside SocketProvider
const NOOP = () => { };
export const useSocket = () => useContext(SocketContext) ?? { socket: null, connected: false, connect: NOOP, disconnect: NOOP };
