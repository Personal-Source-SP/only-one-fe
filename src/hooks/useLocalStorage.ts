import { useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string): [T | undefined, (value: T) => void] {
    const [storedValue, setStoredValue] = useState<T | undefined>(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : undefined;
        } catch (error) {
            console.log(`useLocalStorage error: ${key}`, error);
            return undefined;
        }
    });

    useEffect(() => {
        if (typeof window !== 'undefined' && storedValue !== undefined) {
            try {
                window.localStorage.setItem(key, JSON.stringify(storedValue));
            } catch (error) {
                console.log(`useLocalStorage error: ${key}`, error);
            }
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}
