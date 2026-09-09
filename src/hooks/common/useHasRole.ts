import { useGetIdentity } from '@refinedev/core';

export interface CurrentUserIdentity {
    id?: string;
    email?: string;
    role?: string;
    roles?: string[];
    rights?: string[];
}

export const useHasRole = (roles: string[]): boolean => {
    const { data: currentUser } = useGetIdentity<CurrentUserIdentity>();

    if (!roles?.length || !currentUser) return false;

    const userRoles = currentUser.roles ?? (currentUser.role ? [currentUser.role] : []);
    if (!userRoles.length) return false;

    return roles.some((role) => userRoles.includes(role));
};
