'use client';

import { ChangeEvent } from 'react';
import {
    CustomButton,
    CustomCard,
    CustomDropdown,
    CustomInput,
    CustomModal,
    CustomSelect,
    CustomSpace,
    CustomTag,
    CustomTooltip,
} from '@/components/custom';
import {
    AppstoreOutlined,
    BgColorsOutlined,
    CheckSquareOutlined,
    DeleteOutlined,
    FilterOutlined,
    PushpinFilled,
    PushpinOutlined,
    SearchOutlined,
    TagOutlined,
} from '@ant-design/icons';

import { labelOptions, sortMenu } from './constants';
import { useGoogleKeepPage } from './hooks';
import { ColorPicker } from './components';

const GoogleKeepPage = () => {
    const {
        isModalOpen,
        setIsModalOpen,
        searchQuery,
        setSearchQuery,
        selectedNote,
        newNoteExpanded,
        setNewNoteExpanded,
        newNoteTitle,
        setNewNoteTitle,
        newNoteContent,
        setNewNoteContent,
        showColorPicker,
        setShowColorPicker,
        selectedColor,
        setSelectedColor,
        noteLabels,
        setNoteLabels,
        pinnedNotes,
        unpinnedNotes,
        handleNoteClick,
        handleCreateNote,
        handleColorSelect,
        handleRemoveLabel,
        handleDeleteNote,
        handleTogglePin,
    } = useGoogleKeepPage();

    return (
        <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:gap-8">
            {/* Toolbar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                    <CustomInput
                        placeholder="Tìm kiếm ghi chú..."
                        prefix={<SearchOutlined />}
                        value={searchQuery}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setSearchQuery(e.target.value)
                        }
                        style={{ width: 260, maxWidth: '100%' }}
                        size="middle"
                    />
                    <CustomSpace>
                        <CustomButton icon={<FilterOutlined />} type="default">
                            Lọc
                        </CustomButton>
                        <CustomDropdown menu={{ items: sortMenu }} trigger={['click']}>
                            <CustomButton icon={<AppstoreOutlined />} type="default">
                                Sắp xếp
                            </CustomButton>
                        </CustomDropdown>
                    </CustomSpace>
                </div>
            </div>

            {/* Create Note */}
            <CustomCard
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
                        <CustomInput
                            placeholder="Tiêu đề"
                            value={newNoteTitle}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setNewNoteTitle(e.target.value)
                            }
                            style={{ marginBottom: 8 }}
                            autoFocus
                        />
                        <CustomInput.TextArea
                            allowClear
                            showCount
                            value={newNoteContent}
                            placeholder="Nội dung ghi chú"
                            count={{ max: 1000, show: true }}
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
                            <CustomSpace>
                                <CustomTooltip title="Chọn màu">
                                    <CustomButton
                                        icon={<BgColorsOutlined />}
                                        type="text"
                                        onClick={() => setShowColorPicker((v) => !v)}
                                    />
                                </CustomTooltip>
                                {showColorPicker && (
                                    <div style={{ position: 'absolute', zIndex: 100 }}>
                                        <ColorPicker
                                            value={selectedColor}
                                            onSelect={handleColorSelect}
                                        />
                                    </div>
                                )}
                                <CustomTooltip title="Checklist">
                                    <CustomButton icon={<CheckSquareOutlined />} type="text" />
                                </CustomTooltip>
                                <CustomTooltip title="Nhãn">
                                    <CustomButton icon={<TagOutlined />} type="text" />
                                </CustomTooltip>
                            </CustomSpace>
                            <CustomSpace>
                                <CustomButton
                                    type="text"
                                    onClick={() => {
                                        setNewNoteExpanded(false);
                                        setSelectedColor('#FFFFFF');
                                    }}
                                >
                                    Đóng
                                </CustomButton>
                                <CustomButton type="primary" onClick={handleCreateNote}>
                                    Tạo
                                </CustomButton>
                            </CustomSpace>
                        </div>
                    </div>
                )}
            </CustomCard>

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
                            <CustomCard
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
                                {noteLabels[note.id] && noteLabels[note.id].length > 0 && (
                                    <div style={{ marginTop: 12 }}>
                                        {noteLabels[note.id].map((label, idx) => (
                                            <CustomTag
                                                key={idx}
                                                color="default"
                                                style={{ marginBottom: 4 }}
                                            >
                                                {label}
                                            </CustomTag>
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
                                    <CustomSpace>
                                        <CustomTooltip title={note.isPinned ? 'Bỏ ghim' : 'Ghim'}>
                                            <CustomButton
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
                                        </CustomTooltip>
                                    </CustomSpace>
                                </div>
                            </CustomCard>
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
                        <CustomCard
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
                            {noteLabels[note.id] && noteLabels[note.id].length > 0 && (
                                <div style={{ marginTop: 12 }}>
                                    {noteLabels[note.id].map((label, idx) => (
                                        <CustomTag
                                            key={idx}
                                            color="default"
                                            style={{ marginBottom: 4 }}
                                        >
                                            {label}
                                        </CustomTag>
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
                                <CustomSpace>
                                    <CustomTooltip title={note.isPinned ? 'Bỏ ghim' : 'Ghim'}>
                                        <CustomButton
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
                                    </CustomTooltip>
                                </CustomSpace>
                            </div>
                        </CustomCard>
                    ))}
                </div>
            </div>

            {/* Note Detail CustomModal */}
            <CustomModal
                modalProps={{
                    open: isModalOpen,
                    onCancel: () => setIsModalOpen(false),
                    footer: null,
                    width: 600,
                    styles: {
                        body: {
                            background: selectedNote?.color,
                            padding: 0,
                        },
                    },
                    destroyOnClose: true,
                }}
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
                            <CustomInput
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
                            {noteLabels[selectedNote.id] &&
                                noteLabels[selectedNote.id].length > 0 && (
                                    <div style={{ marginBottom: 12 }}>
                                        {noteLabels[selectedNote.id].map((label, idx) => (
                                            <CustomTag
                                                key={idx}
                                                closable
                                                onClose={() =>
                                                    handleRemoveLabel(selectedNote.id, label)
                                                }
                                                style={{ marginBottom: 4 }}
                                            >
                                                {label}
                                            </CustomTag>
                                        ))}
                                    </div>
                                )}
                            <div style={{ marginBottom: 12 }}>
                                <CustomSelect
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
                            <CustomSpace>
                                <CustomTooltip title={selectedNote.isPinned ? 'Bỏ ghim' : 'Ghim'}>
                                    <CustomButton
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
                                </CustomTooltip>
                                <CustomTooltip title="Chọn màu">
                                    <CustomButton
                                        icon={<BgColorsOutlined />}
                                        type="text"
                                        onClick={() => setShowColorPicker((v) => !v)}
                                    />
                                </CustomTooltip>
                                {showColorPicker && (
                                    <div style={{ position: 'absolute', zIndex: 100 }}>
                                        <ColorPicker
                                            value={selectedNote.color}
                                            onSelect={handleColorSelect}
                                            noteColor={selectedNote.color}
                                        />
                                    </div>
                                )}
                            </CustomSpace>
                            <CustomSpace>
                                <CustomButton
                                    icon={<DeleteOutlined />}
                                    danger
                                    type="text"
                                    onClick={() => {
                                        handleDeleteNote(selectedNote.id);
                                        setIsModalOpen(false);
                                    }}
                                >
                                    Xóa
                                </CustomButton>
                                <CustomButton type="primary" onClick={() => setIsModalOpen(false)}>
                                    Đóng
                                </CustomButton>
                            </CustomSpace>
                        </div>
                    </div>
                )}
            </CustomModal>
        </div>
    );
};

export default GoogleKeepPage;
