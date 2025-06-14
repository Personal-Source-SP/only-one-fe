import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { PropsWithChildren } from 'react';

export default async function LoginLayout({ children }: PropsWithChildren) {
    const data = await getData();

    if (data.session?.user) {
        return redirect('/dashboard');
    }

    return <>{children}</>;
}

async function getData() {
    const session = await getServerSession(authOptions);

    return {
        session,
    };
}
