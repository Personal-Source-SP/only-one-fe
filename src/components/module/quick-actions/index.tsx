import { Button, Space, Tooltip } from 'antd';
import { Icon } from '@iconify/react';


const QuickActions = () => {
    const actions = [
        { icon: 'lucide:file-plus', label: 'Tạo tài liệu', color: '#4285F4' },
        { icon: 'lucide:table', label: 'Tạo bảng tính', color: '#0F9D58' },
        {
            icon: 'lucide:presentation',
            label: 'Tạo thuyết trình',
            color: '#F4B400',
        },
        { icon: 'lucide:image-plus', label: 'Tải ảnh lên', color: '#DB4437' },
        { icon: 'lucide:sticky-note', label: 'Tạo ghi chú', color: '#FBBC04' },
    ];

    return (
        <Space direction="vertical" className="fixed bottom-6 right-6 z-40 md:bottom-8 md:right-8">
            <div className="relative">
                <div className="absolute bottom-0 right-0">
                    <Button type="primary" shape="circle" size="large" className="shadow-lg">
                        <Icon icon="lucide:plus" className="text-2xl" />
                    </Button>
                </div>

                <div className="absolute bottom-16 right-1 flex flex-col-reverse gap-2">
                    {actions.map((action, index) => (
                        <div key={index}>
                            <Tooltip title={action.label} placement="left">
                                <Button
                                    shape="circle"
                                    size="large"
                                    className="shadow-md"
                                    style={{ backgroundColor: action.color, color: 'white' }}
                                >
                                    <Icon icon={action.icon} className="text-xl" />
                                </Button>
                            </Tooltip>
                        </div>
                    ))}
                </div>
            </div>
        </Space>
    );
};

export default QuickActions;
