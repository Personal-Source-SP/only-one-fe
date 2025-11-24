import { Icon } from '@iconify/react';
import { Flex } from 'antd';


type LogoProps = {
    iconSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    showText?: boolean;
    textSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
};

const Logo = ({ iconSize, textSize, showText = true }: LogoProps) => {
    return (
        <Flex align="center" gap={4}>
            <Icon icon="cil:arrow-circle-top" className={`text-${iconSize}`} />
            {showText && !!textSize && <span className={`font-medium text-${textSize}`}>Hub</span>}
            <Icon icon="cil:arrow-circle-bottom" className={`text-${iconSize}`} />
        </Flex>
    );
};

export default Logo;
