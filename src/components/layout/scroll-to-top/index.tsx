'use client';

import { CustomBackTop } from '@/components/custom-antd';
import { Icon } from '@iconify/react';

import { useMainContext } from '@/contexts/MainContext';

export const ScrollToTop = () => {
    const { scrollToTop } = useMainContext();

    return (
        <CustomBackTop
            type="primary"
            onClick={scrollToTop}
            tooltip="Lên đầu trang"
            style={{ insetInlineEnd: 24 }}
            icon={<Icon icon="lucide:arrow-up" className="text-xl" />}
        />
    );
};
