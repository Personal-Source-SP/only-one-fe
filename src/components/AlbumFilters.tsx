import React from 'react';
import { Select, SelectItem } from '@heroui/react';
import {
    SLIDESHOW_DELAY_OPTIONS,
    SORT_FIELD_OPTIONS,
    SORT_ORDER_OPTIONS,
    ITEMS_PER_PAGE_OPTIONS,
} from '@/constants';

type AlbumFiltersProps = {
    slideShowDelay: number;
    sortField: string;
    sortOrder: string;
    itemsPerPage: number;
    onSlideShowDelayChange: (value: number) => void;
    onSortFieldChange: (value: string) => void;
    onSortOrderChange: (value: string) => void;
    onItemsPerPageChange: (value: number) => void;
};

const AlbumFilters: React.FC<AlbumFiltersProps> = ({
    slideShowDelay,
    sortField,
    sortOrder,
    itemsPerPage,
    onSlideShowDelayChange,
    onSortFieldChange,
    onSortOrderChange,
    onItemsPerPageChange,
}) => {
    return (
        <div className="w-full space-y-3">
            <div className="w-full">
                <label className="text-sm mb-1 block">Thời gian trình chiếu</label>
                <Select
                    className="w-full"
                    selectedKeys={new Set([String(slideShowDelay)])}
                    onSelectionChange={(keys) => {
                        const key = Array.from(keys).at(0);
                        if (key) onSlideShowDelayChange(Number(key));
                    }}
                    items={SLIDESHOW_DELAY_OPTIONS.map((o) => ({
                        key: String(o.value),
                        label: o.label,
                    }))}
                >
                    {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                </Select>
            </div>

            <div className="w-full">
                <label className="text-sm mb-1 block">Sắp xếp theo</label>
                <Select
                    className="w-full"
                    selectedKeys={new Set([String(sortField)])}
                    onSelectionChange={(keys) => {
                        const key = Array.from(keys).at(0);
                        if (key) onSortFieldChange(String(key));
                    }}
                    items={SORT_FIELD_OPTIONS.map((o) => ({
                        key: String(o.value),
                        label: o.label,
                    }))}
                >
                    {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                </Select>
            </div>

            <div className="w-full">
                <label className="text-sm mb-1 block">Thứ tự</label>
                <Select
                    className="w-full"
                    selectedKeys={new Set([String(sortOrder)])}
                    onSelectionChange={(keys) => {
                        const key = Array.from(keys).at(0);
                        if (key) onSortOrderChange(String(key));
                    }}
                    items={SORT_ORDER_OPTIONS.map((o) => ({
                        key: String(o.value),
                        label: o.label,
                    }))}
                >
                    {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                </Select>
            </div>

            <div className="w-full">
                <label className="text-sm mb-1 block">Số ảnh mỗi trang</label>
                <Select
                    className="w-full"
                    selectedKeys={new Set([String(itemsPerPage)])}
                    onSelectionChange={(keys) => {
                        const key = Array.from(keys).at(0);
                        if (key) onItemsPerPageChange(Number(key));
                    }}
                    items={ITEMS_PER_PAGE_OPTIONS.map((o) => ({
                        key: String(o.value),
                        label: o.label,
                    }))}
                >
                    {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                </Select>
            </div>
        </div>
    );
};

export default AlbumFilters;
