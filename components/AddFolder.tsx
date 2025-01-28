import { Folder } from "@/interfaces/album";
import { Button, Form, Input, message, Space, ColorPicker } from "antd";
import React, { useState } from "react";

type AddFolderProps = {
  onAddFolder: (folders: Folder[]) => void;
};

const AddFolder: React.FC<AddFolderProps> = ({ onAddFolder }) => {
  const [newFolders, setNewFolders] = useState<Folder[]>([
    { path: "", name: "", color: "#000000" },
  ]);

  const handleAddFolder = () => {
    const validFolders = newFolders.filter(
      (folder) => folder.path && folder.name
    );
    if (validFolders.length > 0) {
      onAddFolder(validFolders);
      setNewFolders([{ path: "", name: "", color: "#000000" }]);
      message.success("Thêm thư mục thành công");
    } else {
      message.error("Vui lòng nhập đầy đủ thông tin thư mục");
    }
  };

  const handleInputChange = (
    index: number,
    field: keyof Folder,
    value: string
  ) => {
    const updatedFolders = [...newFolders];
    updatedFolders[index][field] = value;
    setNewFolders(updatedFolders);
  };

  const handleAddNewRow = () => {
    setNewFolders([...newFolders, { path: "", name: "", color: "#000000" }]);
  };

  return (
    <Form layout="vertical" onFinish={handleAddFolder}>
      {newFolders.map((folder, index) => (
        <Space
          key={index}
          direction="vertical"
          className="w-full mb-4 p-4 border-2 border-gray-200 rounded-md"
        >
          <Form.Item
            label="Đường dẫn thư mục"
            required
            rules={[
              { required: true, message: "Vui lòng nhập đường dẫn thư mục" },
            ]}
          >
            <Input
              value={folder.path}
              placeholder="Đường dẫn thư mục"
              onChange={(e) => handleInputChange(index, "path", e.target.value)}
            />
          </Form.Item>
          <Form.Item
            label="Tên thư mục"
            required
            rules={[{ required: true, message: "Vui lòng nhập tên thư mục" }]}
          >
            <Input
              value={folder.name}
              placeholder="Tên thư mục"
              onChange={(e) => handleInputChange(index, "name", e.target.value)}
            />
          </Form.Item>
          <Form.Item
            label="Màu sắc"
            required
            rules={[{ required: true, message: "Vui lòng nhập màu sắc" }]}
          >
            <ColorPicker
              value={folder.color}
              onChange={(color) =>
                handleInputChange(index, "color", color.toHexString())
              }
            />
          </Form.Item>
        </Space>
      ))}
      <Form.Item>
        <Button type="dashed" onClick={handleAddNewRow} className="w-full mb-2">
          Thêm dòng mới
        </Button>
        <div className="flex justify-end">
          <Button type="primary" htmlType="submit">
            Thêm thư mục
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default AddFolder;
