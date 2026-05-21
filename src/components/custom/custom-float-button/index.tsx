import { Icon } from '@iconify/react/dist/iconify.js';
import { FloatButton } from 'antd';
import type { CSSProperties } from 'react';

type FloatButtonItem = {
    icon: string;
    tooltip: string;
    onClick: () => void;
    badge?: {
        count: number;
    };
};

export type CustomFloatButtonProps = {
    items: FloatButtonItem[];
    open?: boolean;
    icon?: string;
    shape?: 'circle' | 'square';
    style?: CSSProperties;
    type?: 'default' | 'primary';
    trigger?: 'hover' | 'click';
};

export const CustomFloatButton = ({
    items,
    open,
    icon,
    shape,
    style,
    type,
    trigger,
}: CustomFloatButtonProps) => {
    return (
        <FloatButton.Group
            open={open}
            type={type ?? 'primary'}
            shape={shape ?? 'circle'}
            trigger={trigger ?? 'hover'}
            style={{ insetInlineEnd: 94, ...style }}
            icon={icon ? <Icon icon={icon} /> : undefined}
        >
            {items.map((item) => (
                <FloatButton
                    key={item.tooltip}
                    tooltip={item.tooltip}
                    onClick={item.onClick}
                    icon={<Icon icon={item.icon} />}
                />
            ))}
        </FloatButton.Group>
    );
};
