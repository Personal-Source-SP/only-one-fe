"use client";

import ActivityChart from "@/components/module/activity-chart";
import StorageChart from "@/components/module/storage-chart";
import { Card, CardBody, CardHeader, Link } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { FC } from "react";

const DashboardPage: FC = () => {
  // Mock data
  const recentFiles = [
    {
      id: 1,
      name: "Báo cáo Q2 2023.docx",
      type: "doc",
      modified: "2 giờ trước",
      icon: "logos:google-docs",
    },
    {
      id: 2,
      name: "Phân tích doanh thu.xlsx",
      type: "sheet",
      modified: "1 ngày trước",
      icon: "logos:google-sheets",
    },
    {
      id: 3,
      name: "Kế hoạch marketing.pdf",
      type: "pdf",
      modified: "3 ngày trước",
      icon: "logos:adobe-acrobat-reader",
    },
    {
      id: 4,
      name: "Thuyết trình dự án.pptx",
      type: "slide",
      modified: "1 tuần trước",
      icon: "logos:google-slides",
    },
    {
      id: 5,
      name: "Hợp đồng khách hàng.docx",
      type: "doc",
      modified: "2 tuần trước",
      icon: "logos:google-docs",
    },
  ];

  const recentPhotos = [
    { id: 1, url: "https://img.heroui.chat/image/landscape?w=300&h=200&u=1" },
    { id: 2, url: "https://img.heroui.chat/image/landscape?w=300&h=200&u=2" },
    { id: 3, url: "https://img.heroui.chat/image/landscape?w=300&h=200&u=3" },
    { id: 4, url: "https://img.heroui.chat/image/landscape?w=300&h=200&u=4" },
    { id: 5, url: "https://img.heroui.chat/image/landscape?w=300&h=200&u=5" },
    { id: 6, url: "https://img.heroui.chat/image/landscape?w=300&h=200&u=6" },
  ];

  const recentNotes = [
    {
      id: 1,
      title: "Họp nhóm dự án",
      content:
        "Thảo luận về tiến độ và phân công công việc cho tuần tới. Cần hoàn thành báo cáo trước thứ 6.",
      color: "#FEF3C7",
      modified: "1 giờ trước",
    },
    {
      id: 2,
      title: "Danh sách mua sắm",
      content: "- Sữa\n- Trứng\n- Bánh mì\n- Rau xanh\n- Trái cây",
      color: "#DCFCE7",
      modified: "3 giờ trước",
    },
    {
      id: 3,
      title: "Ý tưởng cho dự án mới",
      content:
        "Tích hợp AI vào hệ thống quản lý khách hàng để tự động hóa phân loại và phản hồi email.",
      color: "#DBEAFE",
      modified: "1 ngày trước",
    },
  ];

  // New mock data for charts
  const storageData = [
    { name: "Google Drive", value: 2.8, color: "#4285F4" },
    { name: "Google Photos", value: 1.2, color: "#34A853" },
    { name: "Google Keep", value: 0.2, color: "#FBBC04" },
    { name: "Còn trống", value: 11.8, color: "#E8EAED" },
  ];

  const activityData = [
    { date: "01/06", files: 5, photos: 8, notes: 2 },
    { date: "02/06", files: 3, photos: 12, notes: 1 },
    { date: "03/06", files: 7, photos: 5, notes: 3 },
    { date: "04/06", files: 2, photos: 15, notes: 0 },
    { date: "05/06", files: 6, photos: 10, notes: 4 },
    { date: "06/06", files: 8, photos: 7, notes: 2 },
    { date: "07/06", files: 4, photos: 9, notes: 5 },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <h1 className="text-2xl font-medium mb-2">
          Chào buổi sáng, Minh Nguyễn!
        </h1>
        <p className="text-foreground-600">
          Đây là tổng quan hoạt động của bạn.
        </p>
      </motion.div>

      {/* Activity Chart - New */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium">Hoạt động 7 ngày qua</h2>
          </CardHeader>
          <CardBody>
            <ActivityChart data={activityData} />
          </CardBody>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Drive Files */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Icon icon="logos:google-drive" className="text-xl" />
                <h2 className="text-lg font-medium">
                  Tệp Drive truy cập gần đây
                </h2>
              </div>
              <Link href="/drive" color="primary" underline="hover" size="sm">
                Xem tất cả
              </Link>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {recentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center p-2 rounded-md hover:bg-content2 transition-colors"
                  >
                    <div className="mr-3">
                      <Icon icon={file.icon} className="text-2xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-foreground-500">
                        {file.modified}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1 rounded-full hover:bg-content3 text-foreground-600">
                        <Icon icon="lucide:eye" className="text-lg" />
                      </button>
                      <button className="p-1 rounded-full hover:bg-content3 text-foreground-600">
                        <Icon icon="lucide:download" className="text-lg" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Storage Chart - Replacing Stats */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader>
              <h2 className="text-lg font-medium">Dung lượng lưu trữ</h2>
            </CardHeader>
            <CardBody>
              <StorageChart data={storageData} total="16 GB" />
            </CardBody>
          </Card>
        </motion.div>

        {/* Recent Notes */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Icon icon="logos:google-keep" className="text-xl" />
                <h2 className="text-lg font-medium">Ghi chú Keep gần đây</h2>
              </div>
              <Link href="/keep" color="primary" underline="hover" size="sm">
                Xem tất cả
              </Link>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recentNotes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-md border border-divider p-3 hover:shadow-sm transition-shadow cursor-pointer"
                    style={{ backgroundColor: note.color }}
                  >
                    <h3 className="font-medium mb-1 line-clamp-1">
                      {note.title}
                    </h3>
                    <p className="text-sm text-foreground-700 line-clamp-3 mb-2">
                      {note.content}
                    </p>
                    <p className="text-xs text-foreground-500">
                      {note.modified}
                    </p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Recent Photos */}
        <motion.div variants={item} className="lg:col-span-3">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Icon icon="logos:google-photos" className="text-xl" />
                <h2 className="text-lg font-medium">
                  Ảnh mới nhất trên Photos
                </h2>
              </div>
              <Link href="/photos" color="primary" underline="hover" size="sm">
                Xem tất cả
              </Link>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {recentPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={photo.url}
                      alt="Recent photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
