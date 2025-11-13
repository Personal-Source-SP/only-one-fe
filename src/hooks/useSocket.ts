'use client';

import { SOCKET_EVENTS } from '@/enums';
import { useEffect, useState } from 'react';
import { io, Socket, SocketOptions } from 'socket.io-client';

type UseSocketProps = {
    url: string;
    options?: SocketOptions;
};

export const useSocket = ({ url, options }: UseSocketProps) => {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (!url) return;

        const socketInstance = io(url, {
            ...options,
            transports: ['websocket'],
        });

        socketInstance.connect();

        socketInstance.on(SOCKET_EVENTS.CONNECT, () => {
            setError(null);
            setIsConnected(true);

            console.log('[SOCKET SERVER] Connected to server');
        });

        socketInstance.on(SOCKET_EVENTS.DISCONNECT, () => {
            setIsConnected(false);

            console.log('[SOCKET SERVER] Disconnected from server');
        });

        socketInstance.on(SOCKET_EVENTS.CONNECT_ERROR, (err) => {
            setIsConnected(false);
            setError(err?.message || 'Socket connection error');

            console.error(
                '[SOCKET SERVER] Connection error:',
                err?.message || 'Socket connection error',
            );
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [url, options]);

    return { socket, isConnected, error };
};
