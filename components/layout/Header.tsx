"use client";

import { useAlbumContext } from "@/contexts/AlbumContext";
import { Button } from "antd";
import { Header } from "antd/es/layout/layout";
import { FC } from "react";

const AppHeader: FC = () => {
  const { handleOpenAddFolder, handleOpenAlbumFilters } = useAlbumContext();

  return (
    <Header className="flex justify-end items-center bg-black h-8 p-4 shadow-md">
      <div>
        <Button type="primary" onClick={handleOpenAddFolder} className="mr-2">
          Thêm thư mục
        </Button>

        <Button
          type="primary"
          className="mr-2"
          onClick={handleOpenAlbumFilters}
        >
          Lọc
        </Button>
      </div>
    </Header>
  );
};

export default AppHeader;
