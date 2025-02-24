"use client";

import { FOOTER_BUTTONS } from "@/constants/footer";
import { IFooterButton } from "@/interfaces/footer.interface";
import { Image } from "antd";
import { Footer } from "antd/es/layout/layout";
import { FC, memo, MutableRefObject, useRef } from "react";

const AppFooter: FC = () => {
  const dockButtonsWrapper =
    useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement>;

  const updateButtonWidth = (index: number, size: number) => {
    const buttonElements = dockButtonsWrapper.current
      .children as HTMLCollectionOf<HTMLDivElement>;

    if (buttonElements[index]) {
      buttonElements[index].style.width = `${size}rem`;
    }
  };

  const handleItemsMouseEnter = (itemIndex: number) => {
    const expandSize = 8;

    updateButtonWidth(itemIndex, expandSize);
    updateButtonWidth(itemIndex - 1, expandSize - 1.5);
    updateButtonWidth(itemIndex - 2, expandSize - 2.5);
    updateButtonWidth(itemIndex + 1, expandSize - 1.5);
    updateButtonWidth(itemIndex + 2, expandSize - 2.5);
  };

  const updateWidth = (index: number) => {
    const unexpandSize = 4;
    const buttonElements = dockButtonsWrapper.current
      .children as HTMLCollectionOf<HTMLDivElement>;

    if (buttonElements[index]) {
      buttonElements[index].style.width = `${unexpandSize}em`;
    }
  };

  const handleItemsMouseLeave = (itemIndex: number) => {
    updateWidth(itemIndex);
    updateWidth(itemIndex - 1);
    updateWidth(itemIndex - 2);
    updateWidth(itemIndex + 1);
    updateWidth(itemIndex + 2);
  };

  return (
    <Footer className="p-0">
      <div
        ref={dockButtonsWrapper}
        className="flex h-16 justify-center items-end fixed bottom-2 left-0 right-0 px-2 bg-white bg-opacity-10 rounded-xl w-max m-auto"
      >
        {FOOTER_BUTTONS.map((item: IFooterButton, i: number) => (
          <button
            key={item.title}
            style={{ transition: "all ease .2s" }}
            className="w-16 align-bottom dock-item p-2"
            onMouseEnter={() => handleItemsMouseEnter(i)}
            onMouseLeave={() => handleItemsMouseLeave(i)}
          >
            <Image
              alt="dock icon"
              src={item.logo}
              preview={false}
              className="select-none w-full"
            />
          </button>
        ))}
      </div>
    </Footer>
  );
};

export default memo(AppFooter);
