'use client';

import { Icon } from '@iconify/react';
import { Button, Tooltip } from 'antd';
import { FC } from 'react';
import { useMainContext } from '@/contexts/MainContext';

const ScrollToTop: FC = () => {
    const { scrollToTop } = useMainContext();

    return (
        <Tooltip title="Lên đầu trang" placement="left">
            <Button
                size="large"
                shape="circle"
                type="primary"
                onClick={scrollToTop}
                className="fixed bottom-24 right-6 z-40 shadow-lg md:bottom-8 md:right-8"
            >
                <Icon icon="lucide:arrow-up" className="text-xl" />
            </Button>
        </Tooltip>
    );
};

export default ScrollToTop;
