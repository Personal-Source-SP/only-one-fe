import { useSearchParams } from 'next/navigation';
import queryString from 'query-string';

export const useSearchParamsString = () => {
    const searchParams = useSearchParams();
    return queryString.parse(searchParams.toString());
};
