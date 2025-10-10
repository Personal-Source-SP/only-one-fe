import { ReactNode } from 'react';

import { MainProvider } from '@/contexts/MainContext';

export default async function RootLayout({ children }: { children: ReactNode }) {
    return <MainProvider>{children}</MainProvider>;
}
