'use client';

import { Select, SelectProps } from 'antd';
import { CustomButton } from '../custom-button';
import { CustomDivider } from '../custom-divider';
import { CustomFlex } from '../custom-flex';
import { CustomInput } from '../custom-input';
import { CustomSpace } from '../custom-space';
import { debounce } from 'lodash';
import { useCallback, type ReactNode, type UIEvent } from 'react';

export type CustomSelectProps = SelectProps & {
    debounceTime?: number;
    onPopupScroll?: () => void;
    onInputChange?: (value: string) => void;
};

export const CustomSelect = ({
    debounceTime = 500,
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

    const renderInput = useCallback(
        (menu: ReactNode) => {
            if (!onInputChange) return <></>;

            return (
                <>
                    {menu}
                    <CustomSpace direction="vertical" size={10} className="w-full p-3">
                        <CustomDivider className="!my-0" />
                        <CustomFlex align="center" gap={10}>
                            <CustomInput
                                disabled={props.disabled}
                                className="flex-1"
                                placeholder=" Nhập giá trị"
                            />
                            <CustomButton
                                type="primary"
                                disabled={props.disabled}
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
