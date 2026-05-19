import { Tag } from 'antd';

type StatusTagProps = {
    status?: string;
};

const colorStatusMap: Record<string, string> = {
    ['ready']: '#52c41a', // green
    ['testing']: '#1890ff', // blue
    ['unconfigured']: '#faad14', // orange (was gray)
    ['error']: '#ff4d4f', // red

    ['mapped']: '#52c41a', // green
    ['unmapped']: '#faad14', // orange (was gray)
    ['mapped_has_data']: '#52c41a', // green

    ['pending']: '#faad14', // orange (was gray)
    ['processing']: '#1890ff', // blue
    ['completed']: '#52c41a', // green
    ['failed']: '#ff4d4f', // red

    ['active']: '#52c41a', // green
    ['inactive']: '#faad14', // orange (was gray)

    ['true']: '#52c41a', // green
    ['false']: '#faad14', // orange (was gray)

    ['global']: '#52c41a', // green
    ['item']: '#1890ff', // blue
    ['data_provider']: '#faad14', // orange (was gray)

    ['cron']: '#52c41a', // green
    ['manual']: '#1890ff', // blue
};

const textStatusMap: Record<string, string> = {
    ['ready']: 'Sẵn sàng',
    ['testing']: 'Đang kiểm tra',
    ['unconfigured']: 'Chưa cấu hình',
    ['error']: 'Lỗi',

    ['mapped']: 'Đã ánh xạ',
    ['unmapped']: 'Chưa ánh xạ',
    ['mapped_has_data']: 'Đã ánh xạ (có dữ liệu)',

    ['pending']: 'Chờ xử lý',
    ['processing']: 'Đang xử lý',
    ['completed']: 'Hoàn thành',
    ['failed']: 'Thất bại',

    ['active']: 'Hoạt động',
    ['inactive']: 'Không hoạt động',

    ['true']: 'Hoạt động',
    ['false']: 'Không hoạt động',

    ['global']: 'Lịch biểu toàn cục',
    ['item']: 'Lịch biểu item',
    ['data_provider']: 'Nhà cung cấp',

    ['cron']: 'Tự động',
    ['manual']: 'Thủ công',
};

const randomColor = (): string => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

const StatusTag = ({ status }: StatusTagProps) => {
    if (!status) return '---';

    const color = colorStatusMap[status] ?? randomColor();
    const text = textStatusMap[status] ?? status ?? '---';

    return (
        <Tag color={color} className="text-sm font-medium">
            {text}
        </Tag>
    );
};

export default StatusTag;
