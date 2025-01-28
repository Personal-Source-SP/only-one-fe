"use client";

import { Spin } from "antd";
import React from "react";

const Loading: React.FC = () => (
  <div className="h-screen flex items-center justify-center flex-col bg-gradient-to-r from-purple-500 to-red-500">
    <div className="text-center">
      <h1 className="text-white text-3xl mb-4 font-bold">Album Photo</h1>

      <Spin size="large" className="text-white" />

      <div className="mt-4">
        <span className="text-white">• • • • •</span>
      </div>
    </div>
  </div>
);

export default Loading;
