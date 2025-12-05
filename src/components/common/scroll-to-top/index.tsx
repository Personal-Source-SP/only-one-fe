'use client';

import { Icon } from '@iconify/react';
import { FloatButton } from 'antd';

import { useMainContext } from '@/contexts/MainContext';

const ScrollToTop = () => {
    const { scrollToTop } = useMainContext();

    return (
        <FloatButton
            type="primary"
            onClick={scrollToTop}
            tooltip="Lên đầu trang"
            style={{ insetInlineEnd: 24 }}
            icon={<Icon icon="lucide:arrow-up" className="text-xl" />}
        />
    );
};

export default ScrollToTop;
