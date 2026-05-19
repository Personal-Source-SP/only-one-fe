import { CustomButton, CustomEmpty } from '@/components/custom';
import {
    DatabaseOutlined,
    FileOutlined,
    FolderOutlined,
    InboxOutlined,
    PictureOutlined,
    SearchOutlined,
    SettingOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { CSSProperties, ReactNode } from 'react';

type EmptyVariant =
    | 'default'
    | 'file'
    | 'folder'
    | 'search'
    | 'inbox'
    | 'database'
    | 'picture'
    | 'user'
    | 'setting';

type EmptyProps = {
    style?: CSSProperties;
    image?: string | ReactNode;
    variant?: EmptyVariant;
    className?: string;
    buttonText?: string;
    imageStyle?: CSSProperties;
    description?: string;
    onButtonClick?: () => void;
};

export const Empty = ({
    className,
    buttonText,
    description = 'Không có dữ liệu',
    variant = 'default',
    style,
    imageStyle,
    image,
    onButtonClick,
}: EmptyProps) => {
    const getVariantConfig = () => {
        const configs = {
            default: {
                description: 'Không có dữ liệu',
                image: <InboxOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />,
            },
            file: {
                description: 'Không có file nào',
                image: <FileOutlined style={{ fontSize: 64, color: '#1890ff' }} />,
            },
            folder: {
                description: 'Không có thư mục nào',
                image: <FolderOutlined style={{ fontSize: 64, color: '#52c41a' }} />,
            },
            search: {
                description: 'Không tìm thấy kết quả',
                image: <SearchOutlined style={{ fontSize: 64, color: '#faad14' }} />,
            },
            inbox: {
                description: 'Hộp thư trống',
                image: <InboxOutlined style={{ fontSize: 64, color: '#722ed1' }} />,
            },
            database: {
                description: 'Không có dữ liệu trong cơ sở dữ liệu',
                image: <DatabaseOutlined style={{ fontSize: 64, color: '#13c2c2' }} />,
            },
            picture: {
                description: 'Không có hình ảnh nào',
                image: <PictureOutlined style={{ fontSize: 64, color: '#eb2f96' }} />,
            },
            user: {
                description: 'Không có người dùng nào',
                image: <UserOutlined style={{ fontSize: 64, color: '#fa541c' }} />,
            },
            setting: {
                description: 'Không có cài đặt nào',
                image: <SettingOutlined style={{ fontSize: 64, color: '#595959' }} />,
            },
        };

        return configs[variant];
    };

    const renderButton = () => {
        if (!buttonText || !onButtonClick) return null;

        return (
            <CustomButton type="primary" onClick={onButtonClick}>
                {buttonText}
            </CustomButton>
        );
    };

    const variantConfig = getVariantConfig();

    const finalImage = image || variantConfig.image;
    const finalDescription = description || variantConfig.description;

    return (
        <CustomEmpty
            style={style}
            image={finalImage}
            className={className}
            styles={{ image: imageStyle }}
            description={finalDescription}
        >
            {renderButton()}
        </CustomEmpty>
    );
};
