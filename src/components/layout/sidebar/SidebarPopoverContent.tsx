import { CustomButton } from '@/components/custom';
import { SIDEBAR_NAV_ICON_ACTIVE_CLASS_NAME, SIDEBAR_NAV_SUB_ACTIVE_CLASS_NAME } from '@/constants';
import { SidebarItem } from '@/interfaces';
import { Icon } from '@iconify/react';

type SidebarPopoverContentProps = {
    item: SidebarItem;
    activeMenu: string;
    handleMenuClick: (item: SidebarItem) => void;
};

export const SidebarPopoverContent = ({
    item,
    activeMenu,
    handleMenuClick,
}: SidebarPopoverContentProps) => (
    <section className="min-w-[200px]">
        <div className="mb-2 flex items-center gap-2 border-b border-hub-border pb-2">
            <Icon icon={item.icon} className="h-5 w-5 flex-shrink-0 text-hub-muted" />
            <span className="font-medium text-hub-text">{item.label}</span>
        </div>

        <div className="space-y-1">
            {item.children?.map((child: SidebarItem) => {
                const isSubActive = activeMenu === child.href;

                return (
                    <CustomButton
                        type="text"
                        key={child.href || child.label}
                        onClick={() => handleMenuClick(child)}
                        className={`flex h-auto w-full items-center justify-start gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                            isSubActive
                                ? SIDEBAR_NAV_SUB_ACTIVE_CLASS_NAME
                                : 'text-hub-muted hover:bg-hub-bg hover:text-hub-text'
                        }`}
                    >
                        <Icon
                            icon={child.icon}
                            className={`h-4 w-4 flex-shrink-0 ${
                                isSubActive ? SIDEBAR_NAV_ICON_ACTIVE_CLASS_NAME : 'text-hub-muted'
                            }`}
                        />
                        <span className="truncate">{child.label}</span>
                    </CustomButton>
                );
            })}
        </div>
    </section>
);
