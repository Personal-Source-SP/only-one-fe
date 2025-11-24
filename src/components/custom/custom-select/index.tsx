'use client';

import { Button, Divider, Flex, Input, Select, SelectProps, Space } from 'antd';
import { debounce } from 'lodash';
import { useCallback } from 'react';

type CustomSelectProps = SelectProps & {
    debounceTime?: number;
    onPopupScroll?: () => void;
    onInputChange?: (value: string) => void;
};

const CustomSelect = ({
    debounceTime = 500,
    onPopupScroll,
    onInputChange,
    ...props
}: CustomSelectProps) => {
    const debouncedHandlePopupScroll = useCallback(
        debounce((e: React.UIEvent<HTMLElement>) => {
            if (!onPopupScroll) return;

            const target = e.target as HTMLElement;
            if (!target) return;

            const { scrollTop, clientHeight, scrollHeight } = target;
            if (scrollTop + clientHeight >= scrollHeight) {
                onPopupScroll?.();
            }
        }, debounceTime),
        [onPopupScroll, debounceTime],
    );

    const renderInput = useCallback(
        (menu: React.ReactNode) => {
            if (!onInputChange) return <></>;

            return (
                <>
                    {menu}
                    <Space direction="vertical" size={10} className="w-full p-3">
                        <Divider className="!my-0" />
                        <Flex align="center" gap={10}>
                            <Input
                                disabled={props.disabled}
                                className="flex-1"
                                placeholder=" Nhập giá trị"
                            />
                            <Button
                                type="primary"
                                disabled={props.disabled}
                                onClick={(e) => {
                                    const input = e.currentTarget
                                        .previousElementSibling as HTMLInputElement;
                                    onInputChange?.(input.value);
                                }}
                            >
                                Xác nhận
                            </Button>
                        </Flex>
                    </Space>
                </>
            );
        },
        [onInputChange],
    );

    return (
        <Select
            {...props}
            popupRender={renderInput}
            disabled={props.disabled ?? false}
            onPopupScroll={debouncedHandlePopupScroll}
            optionRender={(option) => (
                <div style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>{option.label}</div>
            )}
        />
    );
};

export default CustomSelect;
