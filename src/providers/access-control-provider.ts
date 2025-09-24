import { AccessControlProvider } from '@refinedev/core';

type ExtendedAccessControlProvider = AccessControlProvider & {
    userRole?: string;
    userPermissions?: string[];
    setUserPermissions: (role: string, permissions: string[]) => void;
};

const accessControlProvider: ExtendedAccessControlProvider = {
    userRole: undefined,
    userPermissions: [],
    setUserPermissions: (role: string, permissions: string[]) => {
        accessControlProvider.userRole = role;
        accessControlProvider.userPermissions = permissions;
    },
    can: async ({ resource, action, params }) => {
        return Promise.resolve({
            can: true,
            reason: undefined,
        });
    },
};

export default accessControlProvider;
