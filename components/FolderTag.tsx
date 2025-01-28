import { Folder } from "@/interfaces/album";
import { CloseOutlined } from "@ant-design/icons";
import { Button, Tag } from "antd";
import React from "react";

type FolderTagsProps = {
  folders: Folder[] | undefined;
  selectedFolder: string | undefined;
  onSelectFolder: (path: string) => void;
  onDeleteFolder: (path: string) => void;
};

const FolderTags: React.FC<FolderTagsProps> = ({
  folders,
  selectedFolder,
  onSelectFolder,
  onDeleteFolder,
}) => {
  if (!folders?.length) {
    return <></>;
  }

  return (
    <div className="flex justify-center flex-wrap mt-4 mb-4">
      {folders.map((folder) => (
        <Tag
          key={folder.path}
          color={folder.color}
          className={`mr-2 mb-2 text-base cursor-pointer hover:opacity-80 transition-opacity ${
            selectedFolder === folder.path ? "font-bold" : ""
          }`}
        >
          <span onClick={() => onSelectFolder(folder.path)}>{folder.name}</span>
          <Button
            type="link"
            className="ml-2"
            icon={<CloseOutlined />}
            onClick={() => onDeleteFolder(folder.path)}
          />
        </Tag>
      ))}
    </div>
  );
};

export default FolderTags;
