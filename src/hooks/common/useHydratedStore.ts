import { useEffect, useState } from 'react';

export const useHydratedStore = <T, F>(
    store: (callback: (state: T) => F) => F,
    callback: (state: T) => F,
) => {
    const result = store(callback);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    return isHydrated ? result : null;
};
