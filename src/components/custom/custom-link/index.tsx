import { CUSTOM_LINK_VARIANT_CLASS_MAP } from '@/constants';
import { CustomLinkVariant } from '@/interfaces';
import Link, { LinkProps } from 'next/link';
import { ReactNode } from 'react';

type CustomLinkProps = LinkProps & {
    href: string;
    children: ReactNode;
    className?: string;
    variant?: CustomLinkVariant;
};

const CustomLink = ({
    href,
    children,
    className,
    variant = 'primary',
    ...linkProps
}: CustomLinkProps) => {
    const mergedClassName = [CUSTOM_LINK_VARIANT_CLASS_MAP[variant], className]
        .filter(Boolean)
        .join(' ');

    return (
        <Link className={mergedClassName} href={href} {...linkProps}>
            {children}
        </Link>
    );
};

export default CustomLink;
