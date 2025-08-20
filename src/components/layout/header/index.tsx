import { GoogleAuthService } from '@/services';
import {
    Avatar,
    Badge,
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Navbar,
    NavbarBrand,
    NavbarContent,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { FC, memo } from 'react';

type HeaderProps = {
    showSearch: boolean;
    mobileMenuOpen: boolean;
    showNotifications: boolean;
    getPageTitle: () => string;
    setShowSearch: (show: boolean) => void;
    setMobileMenuOpen: (open: boolean) => void;
    setShowNotifications: (show: boolean) => void;
};

interface SettingItem {
    label: string;
    icon: string;
    disabled?: boolean;
    onClick: () => void;
}

const googleAuthService = new GoogleAuthService();

const Header: FC<HeaderProps> = ({
    showSearch,
    mobileMenuOpen,
    showNotifications,
    getPageTitle,
    setShowSearch,
    setMobileMenuOpen,
    setShowNotifications,
}) => {
    const settingItem: SettingItem[] = [
        {
            label: 'Thông tin tài khoản',
            icon: 'lucide:user',
            onClick: () => {},
        },
        {
            label: 'Cài đặt',
            icon: 'lucide:settings',
            onClick: () => {},
        },
        {
            label: 'Đăng xuất',
            icon: 'lucide:log-out',
            onClick: () => {},
        },
    ];

    const renderNavbarLeft = () => {
        return (
            <NavbarBrand>
                <Button
                    isIconOnly
                    variant="light"
                    className="mr-2 md:hidden"
                    onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <Icon icon="lucide:menu" className="text-xl" />
                </Button>
                <h1 className="text-xl font-medium">{getPageTitle()}</h1>
            </NavbarBrand>
        );
    };

    const renderNavbarRight = () => {
        return (
            <NavbarContent justify="end" className="gap-2 md:gap-4">
                {/* Mobile search toggle */}
                <Button
                    isIconOnly
                    radius="full"
                    variant="light"
                    className="md:hidden"
                    onPress={() => setShowSearch(!showSearch)}
                >
                    <Icon icon="lucide:search" className="text-xl text-foreground-600" />
                </Button>

                {/* Desktop search */}
                <div className="relative hidden md:block">
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="bg-content2 rounded-full py-2 pl-10 pr-4 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                    />
                    <Icon
                        icon="lucide:search"
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-500"
                    />
                </div>

                <Badge content="" color="danger" shape="circle" placement="top-right">
                    <Button
                        isIconOnly
                        radius="full"
                        variant="light"
                        onPress={() => setShowNotifications(!showNotifications)}
                    >
                        <Icon icon="lucide:bell" className="text-xl text-foreground-600" />
                    </Button>
                </Badge>

                <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                        <Avatar
                            size="sm"
                            className="cursor-pointer"
                            src="https://img.heroui.chat/image/avatar?w=200&h=200&u=1"
                        />
                    </DropdownTrigger>
                    <DropdownMenu aria-label="User Actions">
                        {settingItem.map((item) => (
                            <DropdownItem
                                key={item.label}
                                onPress={item.onClick}
                                isDisabled={item.disabled}
                                startContent={<Icon icon={item.icon} />}
                            >
                                {item.label}
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
                </Dropdown>
            </NavbarContent>
        );
    };

    return (
        <Navbar maxWidth="full" className="border-b border-divider">
            {renderNavbarLeft()}
            {renderNavbarRight()}
        </Navbar>
    );
};

export default memo(Header);
