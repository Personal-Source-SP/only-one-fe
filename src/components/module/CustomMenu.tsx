'use client';

type IHeaderMenuItem = {
    title: string;
    rightLabel?: string;
    separator?: boolean;
};
import { FC, memo } from 'react';

type CustomMenuProps = {
    title: string;
    items: IHeaderMenuItem[];
};

const CustomMenu: FC<CustomMenuProps> = ({ items, title }) => (
    <div
        className={`absolute bg-gray-700 bg-opacity-50 p-1 rounded-md left-0 border border-gray-500 border-box ${
            title === 'Apple' ? 'top-5' : ''
        }`}
    >
        {items?.map(({ title, rightLabel, separator }: IHeaderMenuItem) => (
            <div key={title}>
                <a className="text-white px-2 py-0.5 text-sm whitespace-nowrap text-left rounded-md w-full block hover:bg-blue-600">
                    <p className="flex justify-between">
                        <span>{title}</span>
                        <span className="text-gray-400 ml-16">{rightLabel}</span>
                    </p>
                </a>

                {separator && (
                    <span className="block h-0.5 border-b border-gray-500 my-1 mx-2 text-xs" />
                )}
            </div>
        ))}
    </div>
);

export default memo(CustomMenu);
