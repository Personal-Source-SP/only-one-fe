/** Class Tailwind gắn lên wrapper Ant Design — đọc token từ theme đang chọn. */
export const HUB_ANTD_INPUT_CLASS =
    '[&_.ant-input]:!rounded-hub [&_.ant-input]:!border-hub-border [&_.ant-input]:!bg-hub-surface [&_.ant-input]:!text-hub-text';

export const HUB_ANTD_INPUT_NUMBER_CLASS =
    '!rounded-hub !border-hub-border !bg-hub-surface !text-hub-text [&_.ant-input-number-input]:!text-hub-text [&_.ant-input-number-input]:!bg-transparent';

export const HUB_ANTD_SELECT_CLASS =
    '[&_.ant-select-selector]:!rounded-hub [&_.ant-select-selector]:!border-hub-border [&_.ant-select-selector]:!bg-hub-surface [&_.ant-select-selector]:!text-hub-text';

export const HUB_ANTD_PICKER_CLASS =
    '[&_.ant-picker]:!rounded-hub [&_.ant-picker]:!border-hub-border [&_.ant-picker]:!bg-hub-surface [&_.ant-picker]:!text-hub-text';

export const HUB_ANTD_MODAL_WRAP_CLASS =
    '[&_.ant-modal-content]:!bg-hub-surface [&_.ant-modal-header]:!bg-hub-surface [&_.ant-modal-body]:!bg-hub-surface';

export const HUB_ANTD_SEGMENTED_CLASS =
    '[&_.ant-segmented]:!bg-hub-section-muted [&_.ant-segmented-item-selected]:!bg-hub-surface [&_.ant-segmented-item-selected]:!text-hub-primary';

export const mergeHubAntdClass = (...classes: (string | undefined)[]) =>
    classes.filter(Boolean).join(' ');
