import AppHeader from "@/components/layout/Header";
import AppSider from "@/components/layout/Sider";
import { AlbumProvider } from "@/contexts/AlbumContext";
import { MainProvider } from "@/contexts/MainContext";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Album ảnh",
  description: "Ứng dụng quản lý album ảnh",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen">
          <MainProvider>
            <AlbumProvider>
              <Layout className="min-h-screen max-h-[100vh]">
                <AppHeader />
                <Layout>
                  <AppSider />
                  <Content className="m-4 bg-white border-2 border-gray-200 rounded-md">
                    {children}
                  </Content>
                </Layout>
              </Layout>
            </AlbumProvider>
          </MainProvider>
        </main>
      </body>
    </html>
  );
}
