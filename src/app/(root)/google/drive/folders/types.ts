import { useCustomModal } from '@/hooks';
import { Option } from '@/interfaces';

export type FolderModalProps = {
    folderOptions: Option[];
    modalPropsData: ReturnType<typeof useCustomModal>;
    onSubmit: () => void;
    onClose?: () => void;
};
