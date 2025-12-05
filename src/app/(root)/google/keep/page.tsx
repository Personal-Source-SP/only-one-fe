'use client';

import {
    AppstoreOutlined,
    BgColorsOutlined,
    CheckOutlined,
    CheckSquareOutlined,
    DeleteOutlined,
    FilterOutlined,
    PushpinFilled,
    PushpinOutlined,
    SearchOutlined,
    TagOutlined,
} from '@ant-design/icons';
import { Button, Card, Dropdown, Input, Modal, Select, Space, Tag, Tooltip } from 'antd';
import { ChangeEvent, useEffect, useState } from 'react';

interface Note {
    id: number;
    title: string;
    content: string;
    color: string;
    isPinned: boolean;
    isChecklist: boolean;
    modified: string;
}

const KeepPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [newNoteExpanded, setNewNoteExpanded] = useState(false);
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [newNoteContent, setNewNoteContent] = useState('');

    // Mock data
    const [notes, setNotes] = useState<Note[]>([
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
    ]);

    // Filter notes based on search query
    const filteredNotes = notes.filter(
        (note) =>
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // Separate pinned and unpinned notes
    const pinnedNotes = filteredNotes.filter((note) => note.isPinned);
    const unpinnedNotes = filteredNotes.filter((note) => !note.isPinned);

    const handleNoteClick = (note: Note) => {
        setSelectedNote(note);
        setIsModalOpen(true);
    };

    // Add new state for note color picker
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [selectedColor, setSelectedColor] = useState('#FFFFFF');

    // Add color options
    const colorOptions = [
        { value: '#FFFFFF', label: 'Mặc định' },
        { value: '#FEF3C7', label: 'Vàng nhạt' },
        { value: '#DCFCE7', label: 'Xanh lá nhạt' },
        { value: '#DBEAFE', label: 'Xanh dương nhạt' },
        { value: '#FEE2E2', label: 'Đỏ nhạt' },
        { value: '#F3E8FF', label: 'Tím nhạt' },
        { value: '#E0F2FE', label: 'Xanh da trời' },
        { value: '#FEFCE8', label: 'Vàng nghệ' },
    ];

    // Add new state for note labels
    const [noteLabels, setNoteLabels] = useState<{
        [key: number]: string[];
    }>({
        1: ['Công việc', 'Quan trọng'],
        3: ['Ý tưởng'],
        5: ['Cá nhân'],
    });

    // Add label options
    const labelOptions = ['Công việc', 'Cá nhân', 'Ý tưởng', 'Quan trọng', 'Dự án', 'Mua sắm'];

    const handleCreateNote = () => {
        if (newNoteTitle.trim() === '' && newNoteContent.trim() === '') return;

        const newNote: Note = {
            id: Date.now(),
            title: newNoteTitle,
            content: newNoteContent,
            color: selectedColor,
            isPinned: false,
            isChecklist: false,
            modified: 'Vừa xong',
        };

        setNotes([newNote, ...notes]);
        setNewNoteTitle('');
        setNewNoteContent('');
        setNewNoteExpanded(false);
        setSelectedColor('#FFFFFF');
    };

    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
        setShowColorPicker(false);

        if (selectedNote) {
            // Update the selected note's color
            setNotes(
                notes.map((note) => (note.id === selectedNote.id ? { ...note, color } : note)),
            );
            setSelectedNote({ ...selectedNote, color });
        }
    };

    const handleAddLabel = (noteId: number, label: string) => {
        const currentLabels = noteLabels[noteId] || [];
        if (!currentLabels.includes(label)) {
            setNoteLabels({
                ...noteLabels,
                [noteId]: [...currentLabels, label],
            });
        }
    };

    const handleRemoveLabel = (noteId: number, label: string) => {
        const currentLabels = noteLabels[noteId] || [];
        setNoteLabels({
            ...noteLabels,
            [noteId]: currentLabels.filter((l) => l !== label),
        });
    };

    const handleDeleteNote = (id: number) => {
        setNotes(notes.filter((note) => note.id !== id));
        if (selectedNote?.id === id) {
            setIsModalOpen(false);
        }
    };

    const handleTogglePin = (id: number) => {
        setNotes(
            notes.map((note) => (note.id === id ? { ...note, isPinned: !note.isPinned } : note)),
        );

        if (selectedNote?.id === id) {
            setSelectedNote({ ...selectedNote, isPinned: !selectedNote.isPinned });
        }
    };

    // Masonry layout columns based on screen size
    const [columns, setColumns] = useState(4);

    useEffect(() => {
        const updateColumns = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setColumns(1); // Mobile: 1 column
            } else if (width < 768) {
                setColumns(2); // Small tablet: 2 columns
            } else if (width < 1024) {
                setColumns(3); // Tablet: 3 columns
            } else {
                setColumns(4); // Desktop: 4 columns
            }
        };

        window.addEventListener('resize', updateColumns);
        updateColumns(); // Initial check

        return () => window.removeEventListener('resize', updateColumns);
    }, []);

    // Create column arrays for masonry layout
    const getColumnNotes = (notes: Note[]) => {
        const columnNotes: Note[][] = Array.from({ length: columns }, () => []);

        notes.forEach((note, index) => {
            const columnIndex = index % columns;
            columnNotes[columnIndex].push(note);
        });

        return columnNotes;
    };

    // For antd, we will use grid system instead of custom masonry
    // But keep the columns state for possible future use

    // Dropdown menu for sorting
    const sortMenu = [
        { key: 'date', label: 'Ngày chỉnh sửa' },
        { key: 'title', label: 'Tiêu đề' },
        { key: 'color', label: 'Màu sắc' },
    ];

    // Color picker popover
    const ColorPicker = ({
        value,
        onSelect,
        noteColor,
    }: {
        value: string;
        onSelect: (color: string) => void;
        noteColor?: string;
    }) => (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 8,
                padding: 8,
                background: '#fff',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 1000,
            }}
        >
            {colorOptions.map((color) => (
                <div
                    key={color.value}
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        border: '1px solid #eee',
                        background: color.value,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        position: 'relative',
                    }}
                    title={color.label}
                    onClick={() => onSelect(color.value)}
                >
                    {(value === color.value || noteColor === color.value) && (
                        <CheckOutlined style={{ color: '#333', fontSize: 16 }} />
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Toolbar */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                    }}
                >
                    <Input
                        placeholder="Tìm kiếm ghi chú..."
                        prefix={<SearchOutlined />}
                        value={searchQuery}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setSearchQuery(e.target.value)
                        }
                        style={{ width: 260, maxWidth: '100%' }}
                        size="middle"
                    />
                    <Space>
                        <Button icon={<FilterOutlined />} type="default">
                            Lọc
                        </Button>
                        <Dropdown menu={{ items: sortMenu }} trigger={['click']}>
                            <Button icon={<AppstoreOutlined />} type="default">
                                Sắp xếp
                            </Button>
                        </Dropdown>
                    </Space>
                </div>
            </div>

            {/* Create Note */}
            <Card
                style={{
                    width: '100%',
                    maxWidth: 600,
                    margin: '0 auto',
                    background: newNoteExpanded ? selectedColor : undefined,
                }}
                bodyStyle={{ padding: 16 }}
            >
                {!newNoteExpanded ? (
                    <div
                        style={{ cursor: 'text', color: '#888' }}
                        onClick={() => setNewNoteExpanded(true)}
                    >
                        Tạo một ghi chú...
                    </div>
                ) : (
                    <div>
                        <Input
                            placeholder="Tiêu đề"
                            value={newNoteTitle}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setNewNoteTitle(e.target.value)
                            }
                            style={{ marginBottom: 8 }}
                            autoFocus
                        />
                        <Input.TextArea
                            allowClear
                            showCount
                            value={newNoteContent}
                            count={newNoteContent.length}
                            placeholder="Nội dung ghi chú"
                            onClear={() => setNewNoteContent('')}
                            onChange={(e) => setNewNoteContent(e.target.value)}
                            autoSize={{ minRows: 4 }}
                            style={{
                                background: 'transparent',
                                marginBottom: 8,
                                resize: 'none',
                            }}
                        />
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: 8,
                            }}
                        >
                            <Space>
                                <Tooltip title="Chọn màu">
                                    <Button
                                        icon={<BgColorsOutlined />}
                                        type="text"
                                        onClick={() => setShowColorPicker((v) => !v)}
                                    />
                                </Tooltip>
                                {showColorPicker && (
                                    <div style={{ position: 'absolute', zIndex: 100 }}>
                                        <ColorPicker
                                            value={selectedColor}
                                            onSelect={handleColorSelect}
                                        />
                                    </div>
                                )}
                                <Tooltip title="Checklist">
                                    <Button icon={<CheckSquareOutlined />} type="text" />
                                </Tooltip>
                                <Tooltip title="Nhãn">
                                    <Button icon={<TagOutlined />} type="text" />
                                </Tooltip>
                            </Space>
                            <Space>
                                <Button
                                    type="text"
                                    onClick={() => {
                                        setNewNoteExpanded(false);
                                        setSelectedColor('#FFFFFF');
                                    }}
                                >
                                    Đóng
                                </Button>
                                <Button type="primary" onClick={handleCreateNote}>
                                    Tạo
                                </Button>
                            </Space>
                        </div>
                    </div>
                )}
            </Card>

            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
                <div style={{ marginTop: 32 }}>
                    <h2 style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>GHIM</h2>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: 16,
                        }}
                    >
                        {pinnedNotes.map((note) => (
                            <Card
                                key={note.id}
                                style={{
                                    background: note.color,
                                    cursor: 'pointer',
                                    transition: 'box-shadow 0.2s',
                                }}
                                bodyStyle={{ padding: 16 }}
                                onClick={() => handleNoteClick(note)}
                                hoverable
                            >
                                {note.title && (
                                    <h3 style={{ fontWeight: 500, marginBottom: 8 }}>
                                        {note.title}
                                    </h3>
                                )}
                                <div
                                    style={{
                                        color: '#333',
                                        fontSize: 14,
                                        whiteSpace: 'pre-line',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 6,
                                        WebkitBoxOrient: 'vertical',
                                    }}
                                >
                                    {note.content}
                                </div>
                                {/* Display labels if any */}
                                {noteLabels[note.id] && noteLabels[note.id].length > 0 && (
                                    <div style={{ marginTop: 12 }}>
                                        {noteLabels[note.id].map((label, idx) => (
                                            <Tag
                                                key={idx}
                                                color="default"
                                                style={{ marginBottom: 4 }}
                                            >
                                                {label}
                                            </Tag>
                                        ))}
                                    </div>
                                )}
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginTop: 16,
                                    }}
                                >
                                    <span style={{ fontSize: 12, color: '#888' }}>
                                        {note.modified}
                                    </span>
                                    <Space>
                                        <Tooltip title={note.isPinned ? 'Bỏ ghim' : 'Ghim'}>
                                            <Button
                                                icon={
                                                    note.isPinned ? (
                                                        <PushpinFilled
                                                            style={{ color: '#faad14' }}
                                                        />
                                                    ) : (
                                                        <PushpinOutlined />
                                                    )
                                                }
                                                type="text"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTogglePin(note.id);
                                                }}
                                            />
                                        </Tooltip>
                                    </Space>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Other Notes */}
            <div style={{ marginTop: 16 }}>
                {pinnedNotes.length > 0 && (
                    <h2 style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>KHÁC</h2>
                )}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: 16,
                    }}
                >
                    {unpinnedNotes.map((note) => (
                        <Card
                            key={note.id}
                            style={{
                                background: note.color,
                                cursor: 'pointer',
                                transition: 'box-shadow 0.2s',
                            }}
                            bodyStyle={{ padding: 16 }}
                            onClick={() => handleNoteClick(note)}
                            hoverable
                        >
                            {note.title && (
                                <h3 style={{ fontWeight: 500, marginBottom: 8 }}>{note.title}</h3>
                            )}
                            <div
                                style={{
                                    color: '#333',
                                    fontSize: 14,
                                    whiteSpace: 'pre-line',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 6,
                                    WebkitBoxOrient: 'vertical',
                                }}
                            >
                                {note.content}
                            </div>
                            {/* Display labels if any */}
                            {noteLabels[note.id] && noteLabels[note.id].length > 0 && (
                                <div style={{ marginTop: 12 }}>
                                    {noteLabels[note.id].map((label, idx) => (
                                        <Tag key={idx} color="default" style={{ marginBottom: 4 }}>
                                            {label}
                                        </Tag>
                                    ))}
                                </div>
                            )}
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: 16,
                                }}
                            >
                                <span style={{ fontSize: 12, color: '#888' }}>{note.modified}</span>
                                <Space>
                                    <Tooltip title={note.isPinned ? 'Bỏ ghim' : 'Ghim'}>
                                        <Button
                                            icon={
                                                note.isPinned ? (
                                                    <PushpinFilled style={{ color: '#faad14' }} />
                                                ) : (
                                                    <PushpinOutlined />
                                                )
                                            }
                                            type="text"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTogglePin(note.id);
                                            }}
                                        />
                                    </Tooltip>
                                </Space>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Note Detail Modal */}
            <Modal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={600}
                bodyStyle={{
                    background: selectedNote?.color,
                    padding: 0,
                }}
                destroyOnClose
            >
                {selectedNote && (
                    <div>
                        <div
                            style={{
                                borderBottom: '1px solid #f0f0f0',
                                padding: 16,
                                background: 'rgba(255,255,255,0.7)',
                            }}
                        >
                            <Input
                                placeholder="Tiêu đề"
                                value={selectedNote.title}
                                readOnly
                                style={{
                                    fontSize: 18,
                                    fontWeight: 500,
                                    background: 'transparent',
                                    border: 'none',
                                    padding: 0,
                                }}
                            />
                        </div>
                        <div style={{ padding: 16, minHeight: 200 }}>
                            <div
                                style={{
                                    whiteSpace: 'pre-line',
                                    minHeight: 120,
                                    fontSize: 15,
                                    marginBottom: 12,
                                }}
                            >
                                {selectedNote.content}
                            </div>
                            {/* Display labels */}
                            {noteLabels[selectedNote.id] &&
                                noteLabels[selectedNote.id].length > 0 && (
                                    <div style={{ marginBottom: 12 }}>
                                        {noteLabels[selectedNote.id].map((label, idx) => (
                                            <Tag
                                                key={idx}
                                                closable
                                                onClose={() =>
                                                    handleRemoveLabel(selectedNote.id, label)
                                                }
                                                style={{ marginBottom: 4 }}
                                            >
                                                {label}
                                            </Tag>
                                        ))}
                                    </div>
                                )}
                            {/* Add label dropdown */}
                            <div style={{ marginBottom: 12 }}>
                                <Select
                                    mode="multiple"
                                    placeholder="Thêm nhãn"
                                    value={noteLabels[selectedNote.id] || []}
                                    onChange={(labels) => {
                                        setNoteLabels({
                                            ...noteLabels,
                                            [selectedNote.id]: labels,
                                        });
                                    }}
                                    style={{ minWidth: 180 }}
                                    options={labelOptions.map((label) => ({
                                        value: label,
                                        label,
                                    }))}
                                />
                            </div>
                            <div style={{ fontSize: 12, color: '#888', marginTop: 16 }}>
                                Chỉnh sửa lần cuối: {selectedNote.modified}
                            </div>
                        </div>
                        <div
                            style={{
                                borderTop: '1px solid #f0f0f0',
                                padding: 12,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'rgba(255,255,255,0.7)',
                            }}
                        >
                            <Space>
                                <Tooltip title={selectedNote.isPinned ? 'Bỏ ghim' : 'Ghim'}>
                                    <Button
                                        icon={
                                            selectedNote.isPinned ? (
                                                <PushpinFilled style={{ color: '#faad14' }} />
                                            ) : (
                                                <PushpinOutlined />
                                            )
                                        }
                                        type="text"
                                        onClick={() => handleTogglePin(selectedNote.id)}
                                    />
                                </Tooltip>
                                <Tooltip title="Chọn màu">
                                    <Button
                                        icon={<BgColorsOutlined />}
                                        type="text"
                                        onClick={() => setShowColorPicker((v) => !v)}
                                    />
                                </Tooltip>
                                {showColorPicker && (
                                    <div style={{ position: 'absolute', zIndex: 100 }}>
                                        <ColorPicker
                                            value={selectedNote.color}
                                            onSelect={handleColorSelect}
                                            noteColor={selectedNote.color}
                                        />
                                    </div>
                                )}
                            </Space>
                            <Space>
                                <Button
                                    icon={<DeleteOutlined />}
                                    danger
                                    type="text"
                                    onClick={() => {
                                        handleDeleteNote(selectedNote.id);
                                        setIsModalOpen(false);
                                    }}
                                >
                                    Xóa
                                </Button>
                                <Button type="primary" onClick={() => setIsModalOpen(false)}>
                                    Đóng
                                </Button>
                            </Space>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default KeepPage;
