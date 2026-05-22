'use client';

import {
    CustomButton,
    CustomDivider,
    CustomFlex,
    CustomInput,
    CustomSpace,
} from '@/components/custom';
import { Select, SelectProps } from 'antd';
import { debounce } from 'lodash';
import { useCallback, type ReactElement, type UIEvent } from 'react';

export type CustomSelectProps = SelectProps & {
    debounceTime?: number;
    onPopupScroll?: () => void;
    onInputChange?: (value: string) => void;
};

export const CustomSelect = ({
    debounceTime = 500,
    disabled,
    onPopupScroll,
    onInputChange,
    ...props
}: CustomSelectProps) => {
    const debouncedHandlePopupScroll = useCallback(
        debounce((e: UIEvent<HTMLElement>) => {
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

    const renderPopup = useCallback(
        (menu: ReactElement) => (
            <>
                {menu}
                <CustomSpace direction="vertical" size={10} className="w-full p-3">
                    <CustomDivider className="!my-0" />
                    <CustomFlex align="center" gap={10}>
                        <CustomInput
                            disabled={disabled}
                            className="flex-1"
                            placeholder=" Nhập giá trị"
                        />
                        <CustomButton
                            type="primary"
                            disabled={disabled}
                            onClick={(e) => {
                                const input = e.currentTarget
                                    .previousElementSibling as HTMLInputElement;
                                onInputChange?.(input.value);
                            }}
                        >
                            Xác nhận
                        </CustomButton>
                    </CustomFlex>
                </CustomSpace>
            </>
        ),
        [disabled, onInputChange],
    );

    return (
        <Select
            {...props}
            disabled={disabled ?? false}
            onPopupScroll={debouncedHandlePopupScroll}
            {...(onInputChange ? { popupRender: renderPopup } : {})}
            optionRender={(option) => (
                <div style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>{option.label}</div>
            )}
        />
    );
};
