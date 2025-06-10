import { Role } from '@/enums';
import { AccessControlProvider } from '@refinedev/core';

// extends AccessControlProvider type for custom options
type ExtendedAccessControlProvider = AccessControlProvider & {
    userRole?: Role;
    userPermissions?: string[];
    setUserPermissions: (role: Role, permissions: string[]) => void;
};

export const resourceMappings: Record<string, string> = {};

export const accessControlProvider: ExtendedAccessControlProvider = {
    setUserPermissions: (role: Role, permissions: string[]) => {
        accessControlProvider.userRole = role;
        accessControlProvider.userPermissions = permissions;
    },
    userRole: undefined,
    userPermissions: [],
    can: async ({ resource, action, params }) => {
        return Promise.resolve({
            can: true,
            reason: undefined,
        });
    },
};
