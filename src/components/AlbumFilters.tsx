import React from "react";
import { Form, Select, Space } from "antd";
import {
  SLIDESHOW_DELAY_OPTIONS,
  SORT_FIELD_OPTIONS,
  SORT_ORDER_OPTIONS,
  ITEMS_PER_PAGE_OPTIONS,
} from "@/constants";

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
    <Form layout="vertical" className="w-full">
      <Form.Item label="Thời gian trình chiếu" className="w-full mb-2">
        <Select
          className="w-full"
          value={slideShowDelay}
          onChange={onSlideShowDelayChange}
        >
          {SLIDESHOW_DELAY_OPTIONS.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="Sắp xếp theo" className="w-full mb-2">
        <Select
          value={sortField}
          className="w-full"
          onChange={onSortFieldChange}
        >
          {SORT_FIELD_OPTIONS.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="Thứ tự" className="w-full mb-2">
        <Select
          value={sortOrder}
          className="w-full"
          onChange={onSortOrderChange}
        >
          {SORT_ORDER_OPTIONS.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="Số ảnh mỗi trang" className="w-full mb-2">
        <Select
          className="w-full"
          value={itemsPerPage}
          onChange={onItemsPerPageChange}
        >
          {ITEMS_PER_PAGE_OPTIONS.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </Form>
  );
};

export default AlbumFilters;
