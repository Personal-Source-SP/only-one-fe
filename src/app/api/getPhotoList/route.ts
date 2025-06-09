import { ALLOWED_IMAGE_EXTENSIONS } from "@/constants";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

interface PhotoInfo {
  name: string;
  createdAt: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folder = searchParams.get("folder");

  if (!folder) {
    return NextResponse.json(
      { error: "Không có thư mục được chỉ định" },
      { status: 400 }
    );
  }

  try {
    const files = fs.readdirSync(folder);
    const imageFiles = files.filter((file) =>
      ALLOWED_IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase())
    );

    const photoInfoList: PhotoInfo[] = imageFiles.map((file) => {
      const filePath = path.join(folder, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        createdAt: stats.birthtimeMs,
      };
    });

    return NextResponse.json(photoInfoList);
  } catch (error) {
    console.error("Lỗi khi đọc thư mục:", error);
    return NextResponse.json(
      { error: "Không thể đọc thư mục ảnh" },
      { status: 500 }
    );
  }
}
