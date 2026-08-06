import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (options?: { url?: string }) => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const url = options?.url;

    useEffect(() => {
        const socketUrl = url || process.env.NEXT_PUBLIC_SOCKET_URL || '';
        if (!socketUrl) return;

        socketRef.current = io(socketUrl, {
            autoConnect: true,
            transports: ['websocket'],
        });

        socketRef.current.on('connect', () => {
            setIsConnected(true);
            setError(null);
        });

        socketRef.current.on('connect_error', (err) => {
            setError(err.message);
        });

        socketRef.current.on('disconnect', () => {
            setIsConnected(false);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [url]);

    return {
        socket: socketRef.current,
        isConnected,
        error,
    };
};
