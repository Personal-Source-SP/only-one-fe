import { CustomFlex } from '@/components/custom-antd';
import { Icon } from '@iconify/react';

type LogoProps = {
    iconSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    showText?: boolean;
    textSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
};

export const Logo = ({ iconSize, textSize, showText = true }: LogoProps) => {
    return (
        <CustomFlex align="center" gap={4}>
            <Icon icon="cil:arrow-circle-top" className={`text-${iconSize}`} />
            {showText && !!textSize && <span className={`font-medium text-${textSize}`}>Hub</span>}
            <Icon icon="cil:arrow-circle-bottom" className={`text-${iconSize}`} />
        </CustomFlex>
    );
};
