import { Icon } from '@iconify/react';
import { FC, memo } from 'react';

type LogoProps = {
    iconSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    textSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
};

const Logo: FC<LogoProps> = ({ iconSize, textSize }) => {
    return (
        <>
            <Icon icon="cil:arrow-circle-top" className={`text-${iconSize}`} />
            {!!textSize && <span className={`font-medium text-${textSize}`}>Hub</span>}
            <Icon icon="cil:arrow-circle-bottom" className={`text-${iconSize}`} />
        </>
    );
};

export default memo(Logo);
