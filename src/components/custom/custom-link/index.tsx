import { CustomLinkVariant } from '@/interfaces';
import Link, { LinkProps } from 'next/link';
import { ReactNode } from 'react';

const CUSTOM_LINK_VARIANT_CLASS_MAP: Record<CustomLinkVariant, string> = {
    default: 'cursor-pointer text-hub-muted transition-colors duration-200 hover:text-hub-text',
    primary: 'cursor-pointer text-hub-primary transition-colors duration-200 hover:opacity-80',
};

type CustomLinkProps = LinkProps & {
    href: string;
    children: ReactNode;
    className?: string;
    variant?: CustomLinkVariant;
};

export const CustomLink = ({
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
