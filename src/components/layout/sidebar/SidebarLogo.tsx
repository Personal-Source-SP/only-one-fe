import Image from 'next/image';

type SidebarLogoProps = {
    compact?: boolean;
};

export const SidebarLogo = ({ compact = false }: SidebarLogoProps) => {
    const logoSize = compact ? 42 : 52;

    return (
        <Image
            priority
            alt="Only One Hub"
            src="/favicon.ico"
            width={logoSize}
            height={logoSize}
            className="shrink-0 rounded-md"
        />
    );
};
