import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export const useSearchParamsString = (): string => {
    const searchParams = useSearchParams();

    return useMemo(() => searchParams?.toString() ?? '', [searchParams]);
};
