import {
    HUB_THEME_PALETTE,
    HUB_THEME_PALETTE_IDS,
    HUB_THEME_STORAGE_KEY,
    plusJakartaSans,
} from '@/constants';
import { AntdRegistryProvider } from '@/contexts';
import RefineContext from '@/contexts/RefineContext';
import { getSafeServerSession } from '@/libs/auth-session-helper';
import type { Metadata } from 'next';
import { NavigationGuardProvider } from 'next-navigation-guard';
import { cookies } from 'next/headers';
import { PropsWithChildren, Suspense } from 'react';

import '@/styles/globals.css';

export const metadata: Metadata = {
    title: 'O-O Hub',
    description: 'Only One Hub',
    icons: {
        icon: '/favicon.ico',
    },
};

export default async function RootLayout({ children }: PropsWithChildren) {
    const cookieStore = await cookies();
    const theme = cookieStore.get('theme');

    const session = await getSafeServerSession();

    const hubThemeBootstrapScript = `(function(){try{var k=${JSON.stringify(HUB_THEME_STORAGE_KEY)};var allowed=${JSON.stringify(HUB_THEME_PALETTE_IDS)};var v=localStorage.getItem(k);if(!v)return;var p=JSON.parse(v);if(allowed.indexOf(p)!==-1){document.documentElement.setAttribute("data-hub-theme",p)}}catch(e){}})();`;

    return (
        <html lang="en" data-hub-theme={HUB_THEME_PALETTE} suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: hubThemeBootstrapScript }} />
            </head>
            <body
                className={`${plusJakartaSans.variable} ${plusJakartaSans.className} overflow-x-hidden`}
            >
                <Suspense>
                    <NavigationGuardProvider>
                        <AntdRegistryProvider>
                            <RefineContext session={session} defaultMode={theme?.value}>
                                {children}
                            </RefineContext>
                        </AntdRegistryProvider>
                    </NavigationGuardProvider>
                </Suspense>
            </body>
        </html>
    );
}
