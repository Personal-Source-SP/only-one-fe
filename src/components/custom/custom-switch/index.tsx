import { Col, Flex, Form, Switch } from 'antd';
import { ReactNode } from 'react';

type CustomSwitchProps = {
    formFields: string[];
    fieldLabel: ReactNode;
    span?: number;
    disabled?: boolean;
    fieldPlaceholder?: string;
    onChange?: (checked?: boolean) => void;
};

const CustomSwitch = ({
    fieldLabel,
    span,
    fieldPlaceholder,
    formFields,
    onChange,
    disabled,
}: CustomSwitchProps) => {
    return (
        <Col span={span ?? 12} className="!mb-2">
            <Flex align="center" gap={10} className="!mb-0">
                <Form.Item name={formFields} valuePropName="checked">
                    <Switch onChange={onChange} disabled={disabled} />
                </Form.Item>
                <span className="mb-1">{fieldLabel}</span>
            </Flex>
            {!!fieldPlaceholder && (
                <p className="text-sm text-gray-500 !my-0">{fieldPlaceholder}</p>
            )}
        </Col>
    );
};

export default CustomSwitch;
