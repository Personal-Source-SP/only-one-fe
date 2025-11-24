'use client';

import { useSocket } from '@/hooks';
import { env } from 'next-runtime-env';
import {
    PropsWithChildren,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { Socket } from 'socket.io-client';

interface WebSocketMessage<T = any> {
    data: T;
    event: string;
    timestamp: number;
    clientId?: string;
}

interface Message {
    data?: unknown;
    error?: string;
    event?: string;
    clientId?: string;
    timestamp?: number;
    status?: 'success' | 'error';
}

interface SocketContextValue<T> {
    isConnected: boolean;
    error?: string | null;
    socket?: Socket | null;
    messages?: Record<string, Message[]>;
    joinRoom: (room: string) => void;
    leaveRoom: (room: string) => void;
    subscribeEvent: (eventName: string) => void;
    subscribeEvents: (eventNames: string[]) => void;
    unsubscribeEvent: (eventName: string) => void;
    sendMessage: (socketMessage: string, data: unknown) => void;
}

const SocketContext = createContext<SocketContextValue<unknown> | undefined>(undefined);

export const SocketProvider = ({ children }: PropsWithChildren) => {
    const notificationUrl = env('NEXT_PUBLIC_NOTIFICATION_URL') as string;

    const prevEventsRef = useRef<string[]>([]);
    const handlersRef = useRef<Record<string, (data: WebSocketMessage<any>) => void>>({});

    const { socket, isConnected, error } = useSocket({ url: notificationUrl });

    const [socketEvents, setSocketEvents] = useState<string[]>([]);
    const [messages, setMessages] = useState<Record<string, Message[]>>();

    const createMessageHandler = useCallback(
        (eventName: string) => (data: WebSocketMessage<any>) => {
            setMessages((prev) => ({
                ...prev,
                [eventName]: [...(prev?.[eventName] || []), data],
            }));
            console.log(`[Socket Event] ${eventName}:`, data);
        },
        [],
    );

    useEffect(() => {
        if (!socket || !isConnected) return;

        const prevEvents = prevEventsRef.current;
        const eventsToAdd = socketEvents.filter((event) => !prevEvents.includes(event));
        const eventsToRemove = prevEvents.filter((event) => !socketEvents.includes(event));

        eventsToAdd.forEach((eventName) => {
            const handler = createMessageHandler(eventName);
            handlersRef.current[eventName] = handler;
            socket.on(eventName, handler);
            console.log(`[Socket] Subscribed to: ${eventName}`);
        });

        eventsToRemove.forEach((eventName) => {
            const handler = handlersRef.current[eventName];
            if (handler) {
                socket.off(eventName, handler);
                delete handlersRef.current[eventName];
                console.log(`[Socket] Unsubscribed from: ${eventName}`);
            }
        });

        prevEventsRef.current = socketEvents;

        return () => {
            Object.entries(handlersRef.current).forEach(([eventName, handler]) => {
                socket.off(eventName, handler);
            });

            handlersRef.current = {};
            prevEventsRef.current = [];
        };
    }, [socket, isConnected, socketEvents, createMessageHandler]);

    const subscribeEvent = useCallback((eventName: string) => {
        setSocketEvents((prev) => {
            if (prev.includes(eventName)) return prev;
            return [...prev, eventName];
        });
    }, []);

    const subscribeEvents = useCallback((eventNames: string[]) => {
        setSocketEvents((prev) => {
            const newEvents = eventNames.filter((event) => !prev.includes(event));
            return [...prev, ...newEvents];
        });
    }, []);

    const unsubscribeEvent = useCallback((eventName: string) => {
        setSocketEvents((prev) => prev.filter((event) => event !== eventName));
    }, []);

    const sendMessage = useCallback(
        (socketMessage: string, data: unknown) => {
            if (socket && isConnected) {
                socket.emit(socketMessage, data);
                console.log('[SOCKET SERVER] Send message to socket:', socketMessage, data);
            }
        },
        [socket, isConnected],
    );

    const joinRoom = useCallback(
        (room: string) => {
            if (socket && isConnected) {
                socket.emit('joinRoom', room);
                console.log('[SOCKET SERVER] Joined room:', room);
            }
        },
        [socket, isConnected],
    );

    const leaveRoom = useCallback(
        (room: string) => {
            if (socket && isConnected) {
                socket.emit('leaveRoom', room);
                console.log('[SOCKET SERVER] Left room:', room);
            }
        },
        [socket, isConnected],
    );

    return (
        <SocketContext.Provider
            value={{
                error,
                isConnected,
                messages,
                socket,
                joinRoom,
                leaveRoom,
                sendMessage,
                subscribeEvent,
                subscribeEvents,
                unsubscribeEvent,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};

export const useSocketContext = () => {
    const context = useContext(SocketContext);

    if (!context) {
        throw new Error('useSocketContext must be used within a SocketProvider');
    }

    return context;
};
