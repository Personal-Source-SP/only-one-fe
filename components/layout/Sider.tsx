"use client";

import { useMainContext } from "@/contexts/MainContext";
import { LogoutOutlined, PictureOutlined } from "@ant-design/icons";
import { Image, Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { FC } from "react";

const AppSider: FC = () => {
  const { handleLogout } = useMainContext();

  return (
    <Sider
      collapsed
      width={200}
      theme="dark"
      className="h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-red-600"
    >
      <Menu
        theme="dark"
        mode="inline"
        defaultOpenKeys={["album"]}
        defaultSelectedKeys={["1"]}
        className="h-full border-r-0 bg-black bg-opacity-50"
      >
        <div className="text-center my-4">
          <Image
            alt="Logo"
            width={60}
            height={60}
            preview={false}
            src="/assets/logo.webp"
            className="mx-auto mb-2"
          />
        </div>
        <Menu.Item
          key="1"
          title="Quản lý ảnh"
          icon={<PictureOutlined style={{ width: 28, height: 28 }} />}
        />
        <Menu.Item
          key="2"
          onClick={handleLogout}
          icon={<LogoutOutlined style={{ width: 28, height: 28 }} />}
        >
          Đăng xuất
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default AppSider;
