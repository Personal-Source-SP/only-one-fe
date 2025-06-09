import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { FC, memo } from "react";

type HeaderProps = {
  showSearch: boolean;
  mobileMenuOpen: boolean;
  showNotifications: boolean;
  getPageTitle: () => string;
  setShowSearch: (show: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setShowNotifications: (show: boolean) => void;
};

const Header: FC<HeaderProps> = ({
  showSearch,
  mobileMenuOpen,
  showNotifications,
  getPageTitle,
  setShowSearch,
  setMobileMenuOpen,
  setShowNotifications,
}) => {
  return (
    <Navbar maxWidth="full" className="border-b border-divider">
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

        <Button
          isIconOnly
          radius="full"
          variant="light"
          className="relative"
          onPress={() => setShowNotifications(!showNotifications)}
        >
          <Icon icon="lucide:bell" className="text-xl text-foreground-600" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-danger rounded-full"></span>
        </Button>

        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              size="sm"
              className="cursor-pointer"
              src="https://img.heroui.chat/image/avatar?w=200&h=200&u=1"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="User Actions">
            <DropdownItem
              key="profile"
              startContent={<Icon icon="lucide:user" />}
            >
              Thông tin tài khoản
            </DropdownItem>
            <DropdownItem
              key="settings"
              startContent={<Icon icon="lucide:settings" />}
            >
              Cài đặt
            </DropdownItem>
            <DropdownItem
              key="logout"
              color="danger"
              startContent={<Icon icon="lucide:log-out" />}
            >
              Đăng xuất
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
};

export default memo(Header);
