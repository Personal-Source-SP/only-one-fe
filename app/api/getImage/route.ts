import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  const imageName = request.nextUrl.searchParams.get("imageName");
  const folderName = request.nextUrl.searchParams.get("folderName");

  if (!folderName) {
    return NextResponse.json(
      { error: "Không có thư mục được chỉ định" },
      { status: 400 }
    );
  }

  if (!imageName) {
    return NextResponse.json(
      { error: "Tên ảnh không hợp lệ" },
      { status: 400 }
    );
  }

  const imagePath = path.join(folderName, imageName);

  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const contentType = getContentType(imageName);

    return new NextResponse(imageBuffer, {
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    console.error("Lỗi khi đọc file:", error);
    return NextResponse.json({ error: "Không tìm thấy ảnh" }, { status: 404 });
  }
}

function getContentType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}
