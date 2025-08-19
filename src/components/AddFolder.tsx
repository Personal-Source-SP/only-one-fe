import { Folder } from '@/interfaces/album';
import { Button, Input, Spacer } from '@heroui/react';
import React, { useState } from 'react';

type AddFolderProps = {
    onAddFolder: (folders: Folder[]) => void;
};

const AddFolder: React.FC<AddFolderProps> = ({ onAddFolder }) => {
    const [newFolders, setNewFolders] = useState<Folder[]>([
        { path: '', name: '', color: '#000000' },
    ]);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
        null,
    );

    const handleAddFolder = (e: React.FormEvent) => {
        e.preventDefault();
        const validFolders = newFolders.filter((folder) => folder.path && folder.name);
        if (validFolders.length > 0) {
            onAddFolder(validFolders);
            setNewFolders([{ path: '', name: '', color: '#000000' }]);
            setMessage({ type: 'success', text: 'Thêm thư mục thành công' });
        } else {
            setMessage({ type: 'error', text: 'Vui lòng nhập đầy đủ thông tin thư mục' });
        }
    };

    const handleInputChange = (index: number, field: keyof Folder, value: string) => {
        const updatedFolders = [...newFolders];
        updatedFolders[index][field] = value;
        setNewFolders(updatedFolders);
    };

    const handleAddNewRow = () => {
        setNewFolders([...newFolders, { path: '', name: '', color: '#000000' }]);
    };

    // Simple color picker using input[type=color]
    const ColorInput = ({
        value,
        onChange,
        id,
    }: {
        value: string;
        onChange: (color: string) => void;
        id: string;
    }) => (
        <input
            id={id}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 border-none bg-transparent p-0"
            style={{ cursor: 'pointer' }}
        />
    );

    return (
        <form className="flex flex-col gap-4" onSubmit={handleAddFolder}>
            {message && (
                <div
                    className={`text-sm mb-2 ${
                        message.type === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}
                >
                    {message.text}
                </div>
            )}
            {newFolders.map((folder, index) => (
                <div
                    key={index}
                    className="w-full mb-4 p-4 border-2 border-gray-200 rounded-md flex flex-col gap-4"
                >
                    <div className="flex flex-col gap-1">
                        <label className="font-medium mb-1">
                            Đường dẫn thư mục <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={folder.path}
                            placeholder="Đường dẫn thư mục"
                            onChange={(e) => handleInputChange(index, 'path', e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-medium mb-1">
                            Tên thư mục <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={folder.name}
                            placeholder="Tên thư mục"
                            onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-medium mb-1">
                            Màu sắc <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                            <ColorInput
                                id={`color-picker-${index}`}
                                value={folder.color}
                                onChange={(color) => handleInputChange(index, 'color', color)}
                            />
                            <span className="text-xs text-gray-500">{folder.color}</span>
                        </div>
                    </div>
                </div>
            ))}
            <div className="flex flex-col gap-2">
                <Button
                    variant="flat"
                    onClick={handleAddNewRow}
                    className="w-full mb-2"
                    type="button"
                >
                    Thêm dòng mới
                </Button>
                <div className="flex justify-end">
                    <Button color="primary" type="submit">
                        Thêm thư mục
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default AddFolder;
