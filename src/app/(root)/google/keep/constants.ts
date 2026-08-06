import { Note } from './types';

export const colorOptions = [
    { value: '#FFFFFF', label: 'Mặc định' },
    { value: '#FEF3C7', label: 'Vàng nhạt' },
    { value: '#DCFCE7', label: 'Xanh lá nhạt' },
    { value: '#DBEAFE', label: 'Xanh dương nhạt' },
    { value: '#FEE2E2', label: 'Đỏ nhạt' },
    { value: '#F3E8FF', label: 'Tím nhạt' },
    { value: '#E0F2FE', label: 'Xanh da trời' },
    { value: '#FEFCE8', label: 'Vàng nghệ' },
];

export const labelOptions = ['Công việc', 'Cá nhân', 'Ý tưởng', 'Quan trọng', 'Dự án', 'Mua sắm'];

export const sortMenu = [
    { key: 'date', label: 'Ngày chỉnh sửa' },
    { key: 'title', label: 'Tiêu đề' },
    { key: 'color', label: 'Màu sắc' },
];

export const initialNotes: Note[] = [
    {
        id: 1,
        title: 'Họp nhóm dự án',
        content:
            'Thảo luận về tiến độ và phân công công việc cho tuần tới. Cần hoàn thành báo cáo trước thứ 6.',
        color: '#FEF3C7',
        isPinned: true,
        isChecklist: false,
        modified: '1 giờ trước',
    },
    {
        id: 2,
        title: 'Danh sách mua sắm',
        content: '- Sữa\n- Trứng\n- Bánh mì\n- Rau xanh\n- Trái cây',
        color: '#DCFCE7',
        isPinned: false,
        isChecklist: true,
        modified: '3 giờ trước',
    },
    {
        id: 3,
        title: 'Ý tưởng cho dự án mới',
        content:
            'Tích hợp AI vào hệ thống quản lý khách hàng để tự động hóa phân loại và phản hồi email.',
        color: '#DBEAFE',
        isPinned: true,
        isChecklist: false,
        modified: '1 ngày trước',
    },
    {
        id: 4,
        title: '',
        content: 'Gọi điện cho khách hàng A vào thứ 2 tuần sau.',
        color: '#FEE2E2',
        isPinned: false,
        isChecklist: false,
        modified: '2 ngày trước',
    },
    {
        id: 5,
        title: 'Lịch hẹn tháng 6',
        content:
            '- 5/6: Họp với đối tác\n- 10/6: Đi khám sức khỏe\n- 15/6: Deadline dự án X\n- 20/6: Sinh nhật mẹ',
        color: '#FEFCE8',
        isPinned: false,
        isChecklist: true,
        modified: '3 ngày trước',
    },
    {
        id: 6,
        title: 'Ý tưởng tên sản phẩm',
        content: '1. FlexiSync\n2. ConnectHub\n3. IntegrateFlow\n4. SmartBridge\n5. LinkMaster',
        color: '#F3E8FF',
        isPinned: false,
        isChecklist: false,
        modified: '1 tuần trước',
    },
    {
        id: 7,
        title: 'Mục tiêu quý 3',
        content:
            '- Tăng doanh số 15%\n- Ra mắt tính năng mới\n- Mở rộng thị trường khu vực B\n- Tuyển thêm 2 nhân viên marketing',
        color: '#E0F2FE',
        isPinned: false,
        isChecklist: true,
        modified: '1 tuần trước',
    },
];

export const initialNoteLabels: { [key: number]: string[] } = {
    1: ['Công việc', 'Quan trọng'],
    3: ['Ý tưởng'],
    5: ['Cá nhân'],
};
