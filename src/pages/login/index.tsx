"use client";

import { Button, Card } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { FC } from "react";

const LoginPage: FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-content2 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Icon icon="logos:google" className="text-3xl" />
              <span className="text-2xl font-medium">Hub</span>
            </div>
            <p className="text-foreground-600 text-center">
              Không gian làm việc tập trung của bạn
            </p>
          </div>

          <Button
            color="primary"
            size="lg"
            className="w-full"
            startContent={<Icon icon="logos:google-icon" />}
          >
            Đăng nhập với Google
          </Button>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
