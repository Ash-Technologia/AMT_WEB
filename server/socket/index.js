const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

/**
 * Initialize Socket.io on an existing HTTP server.
 * Call once from server.js after creating httpServer.
 */
const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            credentials: true,
        },
        pingTimeout: 60000,
    });

    // ── JWT auth middleware ──────────────────────────────────────────────────
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) return next(new Error('Authentication error'));
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            socket.userRole = decoded.role;
            next();
        } catch {
            next(new Error('Authentication error'));
        }
    });

    // ── Connection handler ───────────────────────────────────────────────────
    io.on('connection', (socket) => {
        // Every user joins their private room
        socket.join(`user:${socket.userId}`);

        // Admins also join the shared admin room
        if (socket.userRole === 'admin') {
            socket.join('admin');
        }

        console.log(`🔌 Socket connected: user=${socket.userId} role=${socket.userRole}`);

        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: user=${socket.userId}`);
        });
    });

    return io;
};

/**
 * Returns the Socket.io instance.
 * Use this in controllers to emit events.
 */
const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized. Call initSocket() first.');
    return io;
};

module.exports = { initSocket, getIO };
