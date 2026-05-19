import { CustomButton } from '@/components/custom';
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
        <div className="flex items-center gap-2 mb-2 border-b border-divider pb-2">
            <Icon icon={item.icon} className="flex-shrink-0 w-5 h-5 text-slate-500" />
            <span className="font-medium text-slate-800">{item.label}</span>
        </div>

        <div className="space-y-1">
            {item.children?.map((child: SidebarItem) => {
                const isSubActive = activeMenu === child.href;

                return (
                    <CustomButton
                        type="text"
                        key={child.href || child.label}
                        onClick={() => handleMenuClick(child)}
                        className={`w-full flex items-center justify-start gap-2 px-3 py-1.5 rounded-md text-sm h-auto transition-colors ${
                            isSubActive
                                ? 'bg-indigo-50 text-indigo-600 font-medium'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                        <Icon
                            icon={child.icon}
                            className={`flex-shrink-0 w-4 h-4 ${
                                isSubActive ? 'text-indigo-600' : 'text-slate-400'
                            }`}
                        />
                        <span className="truncate">{child.label}</span>
                    </CustomButton>
                );
            })}
        </div>
    </section>
);
