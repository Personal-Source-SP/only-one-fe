import { Folder } from '@/interfaces/album';
import { Button } from '@heroui/react';
import React from 'react';

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
        <div className="flex justify-center flex-wrap mt-4 mb-4 gap-2">
            {folders.map((folder) => (
                <div
                    key={folder.path}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-base transition-opacity cursor-pointer ${
                        selectedFolder === folder.path
                            ? 'bg-primary-100 border-primary text-primary'
                            : 'bg-content2 border-default-200'
                    }`}
                    style={{
                        backgroundColor:
                            selectedFolder === folder.path ? undefined : folder.color + '20',
                    }}
                >
                    <span onClick={() => onSelectFolder(folder.path)}>{folder.name}</span>
                    <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onPress={() => onDeleteFolder(folder.path)}
                    >
                        ×
                    </Button>
                </div>
            ))}
        </div>
    );
};

export default FolderTags;
