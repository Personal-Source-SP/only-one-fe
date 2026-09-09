import { useEffect, useState } from 'react';

export const useMediaQuery = (query: string): boolean => {
    const [matches, setMatches] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia(query);
        const updateMatches = () => setMatches(mediaQuery.matches);

        updateMatches();
        mediaQuery.addEventListener('change', updateMatches);

        return () => {
            mediaQuery.removeEventListener('change', updateMatches);
        };
    }, [query]);

    return matches;
};
