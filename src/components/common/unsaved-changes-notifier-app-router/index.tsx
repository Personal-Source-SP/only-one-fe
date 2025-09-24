'use client';

import { useWarnAboutChange } from '@refinedev/core';
import { useNavigationGuard } from 'next-navigation-guard';
import { FC, memo } from 'react';

type UnsavedChangesNotifierProps = {
    message?: string;
};

const UnsavedChangesNotifierAppRouter: FC<UnsavedChangesNotifierProps> = ({
    message = 'You have unsaved changes that will be lost.',
}) => {
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

export default memo(UnsavedChangesNotifierAppRouter);
