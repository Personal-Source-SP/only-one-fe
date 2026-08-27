import {
    DiscoverySessionStatus,
    DiscoveryUrlStatus,
    type IDiscoverySession,
    type IDiscoveryUrl,
} from '../types';

let mockSessions: IDiscoverySession[] = [
    {
        id: 'session-1',
        sessionCode: 'DISC-AMZ-001',
        dataProviderId: 'provider-1',
        dataProvider: {
            id: 'provider-1',
            name: 'Amazon US',
            identifier: 'amazon_us',
            baseUrl: 'https://amazon.com',
            createdAt: new Date(),
        },
        targetUrl: 'https://amazon.com/best-sellers-electronics',
        status: DiscoverySessionStatus.COMPLETED,
        totalDiscovered: 42,
        totalQueued: 15,
        depth: 2,
        durationSeconds: 128,
        createdAt: new Date(Date.now() - 3600000 * 2),
    },
    {
        id: 'session-2',
        sessionCode: 'DISC-SHP-002',
        dataProviderId: 'provider-2',
        dataProvider: {
            id: 'provider-2',
            name: 'Shopee VN',
            identifier: 'shopee_vn',
            baseUrl: 'https://shopee.vn',
            createdAt: new Date(),
        },
        targetUrl: 'https://shopee.vn/flash-sale',
        status: DiscoverySessionStatus.IN_PROGRESS,
        totalDiscovered: 18,
        totalQueued: 0,
        depth: 1,
        durationSeconds: 45,
        createdAt: new Date(Date.now() - 1800000),
    },
    {
        id: 'session-3',
        sessionCode: 'DISC-TIK-003',
        dataProviderId: 'provider-3',
        dataProvider: {
            id: 'provider-3',
            name: 'Tiki VN',
            identifier: 'tiki_vn',
            baseUrl: 'https://tiki.vn',
            createdAt: new Date(),
        },
        targetUrl: 'https://tiki.vn/deal-hot',
        status: DiscoverySessionStatus.PENDING,
        totalDiscovered: 0,
        totalQueued: 0,
        depth: 1,
        durationSeconds: 0,
        createdAt: new Date(Date.now() - 600000),
    },
];

let mockUrls: IDiscoveryUrl[] = [
    {
        id: 'url-1',
        sessionId: 'session-1',
        sessionCode: 'DISC-AMZ-001',
        dataProviderId: 'provider-1',
        dataProviderName: 'Amazon US',
        url: 'https://amazon.com/dp/B08N5WRWNW',
        title: 'Sony WH-1000XM4 Wireless Noise Cancelling Headphones',
        status: DiscoveryUrlStatus.QUEUED,
        foundAtDepth: 1,
        createdAt: new Date(Date.now() - 3500000),
    },
    {
        id: 'url-2',
        sessionId: 'session-1',
        sessionCode: 'DISC-AMZ-001',
        dataProviderId: 'provider-1',
        dataProviderName: 'Amazon US',
        url: 'https://amazon.com/dp/B09G9FPHY6',
        title: 'Apple iPad 10.2-inch Wi-Fi 64GB Space Gray',
        status: DiscoveryUrlStatus.DISCOVERED,
        foundAtDepth: 2,
        createdAt: new Date(Date.now() - 3400000),
    },
    {
        id: 'url-3',
        sessionId: 'session-1',
        sessionCode: 'DISC-AMZ-001',
        dataProviderId: 'provider-1',
        dataProviderName: 'Amazon US',
        url: 'https://amazon.com/dp/B07FZ8S74R',
        title: 'Echo Dot (4th Gen) Smart speaker with Alexa',
        status: DiscoveryUrlStatus.DISCOVERED,
        foundAtDepth: 1,
        createdAt: new Date(Date.now() - 3300000),
    },
    {
        id: 'url-4',
        sessionId: 'session-2',
        sessionCode: 'DISC-SHP-002',
        dataProviderId: 'provider-2',
        dataProviderName: 'Shopee VN',
        url: 'https://shopee.vn/product/123456/789012',
        title: 'Tai nghe Bluetooth không dây TWS chống ồn',
        status: DiscoveryUrlStatus.DISCOVERED,
        foundAtDepth: 1,
        createdAt: new Date(Date.now() - 1200000),
    },
    {
        id: 'url-5',
        sessionId: 'session-2',
        sessionCode: 'DISC-SHP-002',
        dataProviderId: 'provider-2',
        dataProviderName: 'Shopee VN',
        url: 'https://shopee.vn/product/654321/987654',
        title: 'Bàn phím cơ không dây RGB Hot-swap',
        status: DiscoveryUrlStatus.QUEUED,
        foundAtDepth: 1,
        createdAt: new Date(Date.now() - 1100000),
    },
];

export const getMockSessions = (): IDiscoverySession[] => [...mockSessions];
export const getMockUrls = (): IDiscoveryUrl[] => [...mockUrls];

export const addMockSession = (session: IDiscoverySession): void => {
    mockSessions = [session, ...mockSessions];
};

export const enqueueMockUrls = (urlIds: string[]): void => {
    mockUrls = mockUrls.map((item) =>
        urlIds.includes(item.id) ? { ...item, status: DiscoveryUrlStatus.QUEUED } : item,
    );
};

export const getMockSessionById = (sessionId: string): IDiscoverySession | undefined => {
    return mockSessions.find((s) => s.id === sessionId);
};

export const getMockUrlsBySessionId = (sessionId: string): IDiscoveryUrl[] => {
    return mockUrls.filter((u) => u.sessionId === sessionId);
};
