'use client';

import { useSelectDataProvider } from '@/hooks';
import { useMemo, useState } from 'react';
import { addMockSession, getMockSessions } from './mocks/mock-data';
import {
    DiscoverySessionStatus,
    type CreateSessionFormValues,
    type IDiscoverySession,
} from './types';

export const useDiscoveryPage = () => {
    const [sessions, setSessions] = useState<IDiscoverySession[]>(getMockSessions());
    const [selectedProviderId, setSelectedProviderId] = useState<string | undefined>();
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { options: dataProviderOptions } = useSelectDataProvider();

    const filteredSessions = useMemo(() => {
        return sessions.filter((s) => {
            const matchesProvider = !selectedProviderId || s.dataProviderId === selectedProviderId;
            const matchesSearch =
                !searchTerm ||
                s.sessionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.targetUrl.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesProvider && matchesSearch;
        });
    }, [sessions, selectedProviderId, searchTerm]);

    const handleCreateSession = (values: CreateSessionFormValues) => {
        const provider = dataProviderOptions.find((p) => p.value === values.dataProviderId);
        const providerName = (provider?.label as string) || 'Provider';
        const newSession: IDiscoverySession = {
            id: `session-${Date.now()}`,
            sessionCode: `DISC-${providerName.toUpperCase().slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
            dataProviderId: values.dataProviderId,
            dataProvider: {
                id: values.dataProviderId,
                name: providerName,
                identifier: providerName.toLowerCase().replace(/\s+/g, '_'),
                baseUrl: values.targetUrl,
                createdAt: new Date(),
            },
            targetUrl: values.targetUrl,
            status: DiscoverySessionStatus.IN_PROGRESS,
            totalDiscovered: 0,
            totalQueued: 0,
            depth: values.depth || 1,
            durationSeconds: 0,
            createdAt: new Date(),
        };
        addMockSession(newSession);
        setSessions(getMockSessions());
        setIsCreateModalOpen(false);
    };

    return {
        sessions: filteredSessions,
        dataProviderOptions,
        selectedProviderId,
        setSelectedProviderId,
        searchTerm,
        setSearchTerm,
        isCreateModalOpen,
        setIsCreateModalOpen,
        handleCreateSession,
    };
};
