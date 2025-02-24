"use client";

import { HEADER_ITEMS } from "@/constants/header";
import { IHeaderButton } from "@/interfaces/header.interface";
import dayjs from "dayjs";
import { FC, MouseEvent, memo, useCallback, useEffect, useState } from "react";
import CustomMenu from "../module/CustomMenu";
import { Image } from "antd";

const AppHeader: FC = () => {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [currentActiveMenu, setCurrentActiveMenu] = useState<string>("");

  useEffect(() => {
    calculateDate();
    calculateTime();

    setInterval(() => {
      calculateDate();
      calculateTime();
    }, 1000);
  }, []);

  const calculateDate = () => {
    const currentDate = dayjs();
    const newDate = `${currentDate.format("ddd")} ${currentDate.format(
      "MMM"
    )} ${currentDate.format("DD")}`;

    setDate((prevDate) => (prevDate !== newDate ? newDate : prevDate));
  };

  const calculateTime = () => {
    const currentTime = dayjs();
    const newTime = currentTime.format("hh:mm A");

    setTime((prevTime) => (prevTime !== newTime ? newTime : prevTime));
  };

  const renderMenuLeftItem = useCallback(
    (item: IHeaderButton) => (
      <button
        key={item.title}
        className="pl-5 text-sm relative"
        onClick={(e: MouseEvent<HTMLElement>) => {
          e.stopPropagation();
          setCurrentActiveMenu((past) =>
            past !== item.title ? item.title : ""
          );
        }}
        onMouseEnter={() => {
          if (currentActiveMenu && currentActiveMenu !== item.title) {
            setCurrentActiveMenu(item.title);
          }
        }}
      >
        {item?.logo ? (
          <Image
            preview={false}
            src={item.logo}
            alt="apple icon"
            className="!w-3.5 mt-1"
          />
        ) : (
          <span className="text-white">{item.title}</span>
        )}

        {currentActiveMenu === item.title && (
          <CustomMenu title={currentActiveMenu} items={item.items} />
        )}
      </button>
    ),
    [currentActiveMenu]
  );

  const renderMenuRight = useCallback(
    () => (
      <div className="flex flex-row justify-center items-center">
        <button className="w-8 h-5 mr-5 mt-0.5">
          <img
            alt="menubar icon"
            className="w-full h-full"
            src="/images/battery-icon.png"
          />
        </button>
        <button className="w-4 mr-5">
          <img
            alt="menubar icon"
            className="w-full"
            src="/images/wifi-icon.png"
          />
        </button>
        <button className="w-4 mr-5">
          <img
            alt="menubar icon"
            className="w-full"
            src="/images/magnifier-icon.png"
          />
        </button>
        <button className="w-3.5 mr-5">
          <img
            alt="menubar icon"
            className="w-full"
            src="/images/control-center-icon.png"
          />
        </button>
        <button className="w-3.5 mr-5">
          <img
            alt="menubar icon"
            className="w-full"
            src="/images/siri-logo.png"
          />
        </button>
        <button className="flex flex-row justify-center items-center">
          <p className="text-sm text-white mr-2">{date}</p>
          <p className="text-sm text-white mr-5">{time}</p>
        </button>
      </div>
    ),
    [date, time]
  );

  return (
    <div className="border-box flex flex-row justify-between w-screen h-6 bg-gray-600 fixed top-0 left-0 bg-opacity-40 border-b border-gray-500 z-10">
      <div className="flex items-center">
        {HEADER_ITEMS.map((item: IHeaderButton) => renderMenuLeftItem(item))}
      </div>

      {renderMenuRight()}
    </div>
  );
};

export default memo(AppHeader);
