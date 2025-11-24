'use client';

import { useWarnAboutChange } from '@refinedev/core';
import { useNavigationGuard } from 'next-navigation-guard';


type UnsavedChangesNotifierProps = {
    message?: string;
};

const UnsavedChangesNotifierAppRouter = ({
    message = 'You have unsaved changes that will be lost.',
}: UnsavedChangesNotifierProps) => {
    const { warnWhen, setWarnWhen } = useWarnAboutChange();

    useNavigationGuard({
        enabled: warnWhen,
        confirm: () => {
            const result = window.confirm(message);

            if (result) {
                setWarnWhen(false);
            }

            return result;
        },
    });

    return null;
};

export default UnsavedChangesNotifierAppRouter;
