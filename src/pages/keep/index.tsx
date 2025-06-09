"use client";

import {
  Button,
  Card,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { FC, useEffect, useState } from "react";

interface Note {
  id: number;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  isChecklist: boolean;
  modified: string;
}

const KeepPage: FC = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [newNoteExpanded, setNewNoteExpanded] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  // Mock data
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 1,
      title: "Họp nhóm dự án",
      content:
        "Thảo luận về tiến độ và phân công công việc cho tuần tới. Cần hoàn thành báo cáo trước thứ 6.",
      color: "#FEF3C7",
      isPinned: true,
      isChecklist: false,
      modified: "1 giờ trước",
    },
    {
      id: 2,
      title: "Danh sách mua sắm",
      content: "- Sữa\n- Trứng\n- Bánh mì\n- Rau xanh\n- Trái cây",
      color: "#DCFCE7",
      isPinned: false,
      isChecklist: true,
      modified: "3 giờ trước",
    },
    {
      id: 3,
      title: "Ý tưởng cho dự án mới",
      content:
        "Tích hợp AI vào hệ thống quản lý khách hàng để tự động hóa phân loại và phản hồi email.",
      color: "#DBEAFE",
      isPinned: true,
      isChecklist: false,
      modified: "1 ngày trước",
    },
    {
      id: 4,
      title: "",
      content: "Gọi điện cho khách hàng A vào thứ 2 tuần sau.",
      color: "#FEE2E2",
      isPinned: false,
      isChecklist: false,
      modified: "2 ngày trước",
    },
    {
      id: 5,
      title: "Lịch hẹn tháng 6",
      content:
        "- 5/6: Họp với đối tác\n- 10/6: Đi khám sức khỏe\n- 15/6: Deadline dự án X\n- 20/6: Sinh nhật mẹ",
      color: "#FEFCE8",
      isPinned: false,
      isChecklist: true,
      modified: "3 ngày trước",
    },
    {
      id: 6,
      title: "Ý tưởng tên sản phẩm",
      content:
        "1. FlexiSync\n2. ConnectHub\n3. IntegrateFlow\n4. SmartBridge\n5. LinkMaster",
      color: "#F3E8FF",
      isPinned: false,
      isChecklist: false,
      modified: "1 tuần trước",
    },
    {
      id: 7,
      title: "Mục tiêu quý 3",
      content:
        "- Tăng doanh số 15%\n- Ra mắt tính năng mới\n- Mở rộng thị trường khu vực B\n- Tuyển thêm 2 nhân viên marketing",
      color: "#E0F2FE",
      isPinned: false,
      isChecklist: true,
      modified: "1 tuần trước",
    },
  ]);

  // Filter notes based on search query
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate pinned and unpinned notes
  const pinnedNotes = filteredNotes.filter((note) => note.isPinned);
  const unpinnedNotes = filteredNotes.filter((note) => !note.isPinned);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    onOpen();
  };

  // Add new state for note color picker
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");

  // Add color options
  const colorOptions = [
    { value: "#FFFFFF", label: "Mặc định" },
    { value: "#FEF3C7", label: "Vàng nhạt" },
    { value: "#DCFCE7", label: "Xanh lá nhạt" },
    { value: "#DBEAFE", label: "Xanh dương nhạt" },
    { value: "#FEE2E2", label: "Đỏ nhạt" },
    { value: "#F3E8FF", label: "Tím nhạt" },
    { value: "#E0F2FE", label: "Xanh da trời" },
    { value: "#FEFCE8", label: "Vàng nghệ" },
  ];

  // Add new state for note labels
  const [noteLabels, setNoteLabels] = useState<{
    [key: number]: string[];
  }>({
    1: ["Công việc", "Quan trọng"],
    3: ["Ý tưởng"],
    5: ["Cá nhân"],
  });

  // Add label options
  const labelOptions = [
    "Công việc",
    "Cá nhân",
    "Ý tưởng",
    "Quan trọng",
    "Dự án",
    "Mua sắm",
  ];

  const handleCreateNote = () => {
    if (newNoteTitle.trim() === "" && newNoteContent.trim() === "") return;

    const newNote: Note = {
      id: Date.now(),
      title: newNoteTitle,
      content: newNoteContent,
      color: selectedColor,
      isPinned: false,
      isChecklist: false,
      modified: "Vừa xong",
    };

    setNotes([newNote, ...notes]);
    setNewNoteTitle("");
    setNewNoteContent("");
    setNewNoteExpanded(false);
    setSelectedColor("#FFFFFF");
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setShowColorPicker(false);

    if (selectedNote) {
      // Update the selected note's color
      setNotes(
        notes.map((note) =>
          note.id === selectedNote.id ? { ...note, color } : note
        )
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
      onClose();
    }
  };

  const handleTogglePin = (id: number) => {
    setNotes(
      notes.map((note) =>
        note.id === id ? { ...note, isPinned: !note.isPinned } : note
      )
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

    window.addEventListener("resize", updateColumns);
    updateColumns(); // Initial check

    return () => window.removeEventListener("resize", updateColumns);
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

  const pinnedColumnNotes = getColumnNotes(pinnedNotes);
  const unpinnedColumnNotes = getColumnNotes(unpinnedNotes);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <Input
          placeholder="Tìm kiếm ghi chú..."
          startContent={
            <Icon icon="lucide:search" className="text-foreground-500" />
          }
          value={searchQuery}
          onValueChange={setSearchQuery}
          className="w-full sm:w-64"
          size="sm"
        />

        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button
            color="primary"
            variant="flat"
            startContent={<Icon icon="lucide:filter" />}
            size="sm"
          >
            Lọc
          </Button>
          <Dropdown>
            <DropdownTrigger>
              <Button
                color="primary"
                variant="flat"
                startContent={<Icon icon="lucide:layout-grid" />}
                size="sm"
              >
                Sắp xếp
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem key="date">Ngày chỉnh sửa</DropdownItem>
              <DropdownItem key="title">Tiêu đề</DropdownItem>
              <DropdownItem key="color">Màu sắc</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Create Note */}
      <Card className="w-full sm:w-3/4 md:w-2/3 lg:w-1/2 mx-auto">
        {!newNoteExpanded ? (
          <div
            className="p-4 cursor-text"
            onClick={() => setNewNoteExpanded(true)}
          >
            <p className="text-foreground-500">Tạo một ghi chú...</p>
          </div>
        ) : (
          <div className="p-4" style={{ backgroundColor: selectedColor }}>
            <Input
              placeholder="Tiêu đề"
              value={newNoteTitle}
              onValueChange={setNewNoteTitle}
              variant="underlined"
              className="mb-2"
              autoFocus
            />
            <textarea
              placeholder="Nội dung ghi chú"
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="w-full min-h-[100px] p-2 text-sm focus:outline-none resize-none bg-transparent"
            />
            <div className="flex justify-between items-center mt-2">
              <div className="flex gap-1">
                <div className="relative">
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onPress={() => setShowColorPicker(!showColorPicker)}
                  >
                    <Icon
                      icon="lucide:palette"
                      className="text-foreground-500"
                    />
                  </Button>

                  {showColorPicker && (
                    <div className="absolute bottom-full left-0 mb-2 p-2 bg-content1 rounded-md shadow-lg z-10 grid grid-cols-4 gap-1">
                      {colorOptions.map((color) => (
                        <div
                          key={color.value}
                          className="w-8 h-8 rounded-full cursor-pointer border border-divider flex items-center justify-center"
                          style={{ backgroundColor: color.value }}
                          onClick={() => handleColorSelect(color.value)}
                          title={color.label}
                        >
                          {selectedColor === color.value && (
                            <Icon
                              icon="lucide:check"
                              className="text-foreground-600"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button isIconOnly variant="light" size="sm">
                  <Icon
                    icon="lucide:check-square"
                    className="text-foreground-500"
                  />
                </Button>
                <Button isIconOnly variant="light" size="sm">
                  <Icon icon="lucide:tag" className="text-foreground-500" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="light"
                  size="sm"
                  onPress={() => {
                    setNewNoteExpanded(false);
                    setSelectedColor("#FFFFFF");
                  }}
                >
                  Đóng
                </Button>
                <Button color="primary" size="sm" onPress={handleCreateNote}>
                  Tạo
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-foreground-500 mb-2">GHIM</h2>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-wrap gap-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
              {pinnedNotes.map((note) => (
                <motion.div key={note.id} variants={item}>
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    style={{ backgroundColor: note.color }}
                    isPressable
                    onPress={() => handleNoteClick(note)}
                  >
                    <div className="p-4">
                      {note.title && (
                        <h3 className="font-medium mb-2">{note.title}</h3>
                      )}
                      <p className="text-sm text-foreground-700 whitespace-pre-line line-clamp-6">
                        {note.content}
                      </p>

                      {/* Display labels if any */}
                      {noteLabels[note.id] &&
                        noteLabels[note.id].length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {noteLabels[note.id].map((label, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 rounded-full bg-black/10 text-foreground-700"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        )}

                      <div className="flex justify-between items-center mt-4">
                        <p className="text-xs text-foreground-500">
                          {note.modified}
                        </p>
                        <div className="flex gap-1">
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            onPress={(e: any) => {
                              e.stopPropagation();
                              handleTogglePin(note.id);
                            }}
                          >
                            <Icon
                              icon="lucide:pin"
                              className="text-foreground-600 fill-foreground-600"
                            />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Other Notes */}
      <div className="mt-4">
        {pinnedNotes.length > 0 && (
          <h2 className="text-sm font-medium text-foreground-500 mb-2">KHÁC</h2>
        )}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {unpinnedNotes.map((note) => (
            <motion.div key={note.id} variants={item}>
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                style={{ backgroundColor: note.color }}
                isPressable
                onPress={() => handleNoteClick(note)}
              >
                <div className="p-4">
                  {note.title && (
                    <h3 className="font-medium mb-2">{note.title}</h3>
                  )}
                  <p className="text-sm text-foreground-700 whitespace-pre-line line-clamp-6">
                    {note.content}
                  </p>

                  {/* Display labels if any */}
                  {noteLabels[note.id] && noteLabels[note.id].length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {noteLabels[note.id].map((label, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 rounded-full bg-black/10 text-foreground-700"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4">
                    <p className="text-xs text-foreground-500">
                      {note.modified}
                    </p>
                    <div className="flex gap-1">
                      <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onPress={(e: any) => {
                          e.stopPropagation();
                          handleTogglePin(note.id);
                        }}
                      >
                        <Icon
                          icon="lucide:pin"
                          className="text-foreground-600"
                        />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Note Detail Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent style={{ backgroundColor: selectedNote?.color }}>
          {(onClose) => (
            <>
              {selectedNote && (
                <>
                  <ModalHeader className="border-b border-divider">
                    <Input
                      placeholder="Tiêu đề"
                      value={selectedNote.title}
                      variant="underlined"
                      className="text-lg"
                      readOnly
                    />
                  </ModalHeader>
                  <ModalBody>
                    <div
                      className="whitespace-pre-line py-2"
                      style={{ minHeight: "200px" }}
                    >
                      {selectedNote.content}
                    </div>

                    {/* Display labels */}
                    {noteLabels[selectedNote.id] &&
                      noteLabels[selectedNote.id].length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {noteLabels[selectedNote.id].map((label, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-0.5 rounded-full bg-black/10 text-foreground-700 flex items-center gap-1"
                            >
                              {label}
                              <button
                                className="text-foreground-500 hover:text-foreground-700"
                                onClick={() =>
                                  handleRemoveLabel(selectedNote.id, label)
                                }
                              >
                                <Icon icon="lucide:x" className="text-xs" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                    {/* Add label dropdown */}
                    <div className="mt-3">
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            variant="flat"
                            size="sm"
                            startContent={<Icon icon="lucide:tag" />}
                          >
                            Thêm nhãn
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          {labelOptions.map((label) => (
                            <DropdownItem
                              key={label}
                              onPress={() =>
                                handleAddLabel(selectedNote.id, label)
                              }
                              isDisabled={noteLabels[selectedNote.id]?.includes(
                                label
                              )}
                            >
                              {label}
                            </DropdownItem>
                          ))}
                        </DropdownMenu>
                      </Dropdown>
                    </div>

                    <p className="text-xs text-foreground-500 mt-4">
                      Chỉnh sửa lần cuối: {selectedNote.modified}
                    </p>
                  </ModalBody>
                  <ModalFooter className="border-t border-divider">
                    <div className="flex justify-between w-full">
                      <div className="flex gap-2">
                        <Button
                          isIconOnly
                          variant="light"
                          onPress={() => handleTogglePin(selectedNote.id)}
                        >
                          <Icon
                            icon="lucide:pin"
                            className={`text-foreground-600 ${
                              selectedNote.isPinned ? "fill-foreground-600" : ""
                            }`}
                          />
                        </Button>
                        <div className="relative">
                          <Button
                            isIconOnly
                            variant="light"
                            onPress={() => setShowColorPicker(!showColorPicker)}
                          >
                            <Icon
                              icon="lucide:palette"
                              className="text-foreground-600"
                            />
                          </Button>

                          {showColorPicker && (
                            <div className="absolute bottom-full left-0 mb-2 p-2 bg-content1 rounded-md shadow-lg z-10 grid grid-cols-4 gap-1">
                              {colorOptions.map((color) => (
                                <div
                                  key={color.value}
                                  className="w-8 h-8 rounded-full cursor-pointer border border-divider flex items-center justify-center"
                                  style={{ backgroundColor: color.value }}
                                  onClick={() => handleColorSelect(color.value)}
                                  title={color.label}
                                >
                                  {selectedNote.color === color.value && (
                                    <Icon
                                      icon="lucide:check"
                                      className="text-foreground-600"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          color="danger"
                          variant="light"
                          onPress={() => {
                            handleDeleteNote(selectedNote.id);
                            onClose();
                          }}
                        >
                          Xóa
                        </Button>
                        <Button color="primary" onPress={onClose}>
                          Đóng
                        </Button>
                      </div>
                    </div>
                  </ModalFooter>
                </>
              )}
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default KeepPage;
