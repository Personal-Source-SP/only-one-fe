"use client";

import { useMainContext } from "@/contexts/MainContext";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Image, Input, message } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomeClient() {
  const router = useRouter();
  const { token, handleLogin } = useMainContext();

  useEffect(() => {
    if (token) {
      router.push("/album");
    }
  }, [token, router]);

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      const result = await handleLogin(values.email, values.password);

      if (result) {
        router.push("/album");
      } else {
        message.error("Đăng nhập thất bại");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi đăng nhập");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-purple-500 to-red-500">
      <div className="text-center">
        <div className="mb-6">
          <Image
            width={60}
            height={60}
            alt="Profile"
            preview={false}
            src="/assets/logo.webp"
            className="rounded-full mx-auto"
          />
        </div>

        <Form onFinish={handleSubmit}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              {
                type: "email",
                message: "Email không đúng định dạng!",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Email"
              prefix={<UserOutlined />}
              className="w-72 focus:border-none focus:outline-none"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              size="large"
              className="w-72"
              placeholder="Mật khẩu"
              prefix={<LockOutlined />}
            />
          </Form.Item>

          <Button
            size="large"
            type="primary"
            className="w-72"
            htmlType="submit"
            style={{ backgroundColor: "#000", borderColor: "#000" }}
          >
            Đăng nhập
          </Button>
        </Form>
      </div>
    </div>
  );
}
