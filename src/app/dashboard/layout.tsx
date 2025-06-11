import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { getServerSession } from 'next-auth/next';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { PropsWithChildren } from 'react';

const MainLayout = dynamic(() => import('@/components/layout/index'), {
    ssr: false,
});

export default async function Layout({ children }: PropsWithChildren) {
    const data = await getData();

    if (!data.session?.user) {
        return redirect('/login');
    }

    return <MainLayout>{children}</MainLayout>;
}

async function getData() {
    const session = await getServerSession(authOptions);
    return {
        session,
    };
}
