import { Drawer, DrawerProps } from "antd";
import React, { ReactNode } from "react";

interface CustomDrawerProps extends DrawerProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

const CustomDrawer: React.FC<CustomDrawerProps> = ({
  title,
  children,
  onClose,
  width = 378,
  placement = "right",
  ...rest
}) => {
  return (
    <Drawer
      title={title}
      width={width}
      closable={true}
      onClose={onClose}
      placement={placement}
      {...rest}
    >
      <section>{children}</section>
    </Drawer>
  );
};

export default CustomDrawer;
