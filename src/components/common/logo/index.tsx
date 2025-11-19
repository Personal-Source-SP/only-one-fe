import { Icon } from '@iconify/react';
import { Flex } from 'antd';
import { FC } from 'react';

type LogoProps = {
    showText?: boolean;
    iconSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    textSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
};

const Logo: FC<LogoProps> = ({ iconSize, textSize, showText = true }) => {
    return (
        <Flex align="center" gap={4}>
            <Icon icon="cil:arrow-circle-top" className={`text-${iconSize}`} />
            {showText && !!textSize && <span className={`font-medium text-${textSize}`}>Hub</span>}
            <Icon icon="cil:arrow-circle-bottom" className={`text-${iconSize}`} />
        </Flex>
    );
};

export default Logo;
