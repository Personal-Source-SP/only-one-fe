'use client';

import {
    CustomBadge,
    CustomButton,
    CustomCard,
    CustomDivider,
    CustomInput,
    CustomSpace,
    CustomTag,
    CustomTypography,
} from '@/components/custom-antd';
import { useMainContext } from '@/contexts/MainContext';
import { NotificationType } from '@/enums';
import {
    CheckOutlined,
    CompressOutlined,
    CopyOutlined,
    EditOutlined,
    ExpandAltOutlined,
    FormatPainterOutlined,
} from '@ant-design/icons';
import * as jsBeautify from 'js-beautify';
import dynamic from 'next/dynamic';
import { CSSProperties, useEffect, useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';

const CustomMonacoEditor = dynamic(
    () => import('./CustomMonacoEditor').then((module) => ({ default: module.CustomMonacoEditor })),
    {
        ssr: false,
    },
);

export type CodeDisplayProps = {
    code: string;
    title?: string;
    loading?: boolean;
    expanded?: boolean;
    maxHeight?: string;
    compareCode?: string;
    compareVersion?: number;
    processingTime?: number;
    isDisplayLanguage?: boolean;
    language?: 'json' | 'javascript' | 'html';
    onCodeChange?: (newCode: string) => void;
};

const JS_BEAUTIFY_OPTIONS: jsBeautify.JSBeautifyOptions = {
    indent_size: 2,
    indent_char: ' ',
    max_preserve_newlines: 2,
    preserve_newlines: true,
    keep_array_indentation: false,
    break_chained_methods: false,
    brace_style: 'collapse',
    space_before_conditional: true,
    unescape_strings: false,
    jslint_happy: false,
    end_with_newline: true,
    wrap_line_length: 0,
    comma_first: false,
    e4x: false,
    indent_empty_lines: false,
};

const HTML_BEAUTIFY_OPTIONS: jsBeautify.HTMLBeautifyOptions = {
    indent_size: 2,
    indent_char: ' ',
    max_preserve_newlines: 2,
    preserve_newlines: true,
    indent_inner_html: false,
    wrap_line_length: 0,
    end_with_newline: true,
};

export const CodeDisplay = ({
    code,
    title,
    loading,
    compareCode,
    compareVersion,
    processingTime,
    maxHeight = '100px',
    expanded = false,
    language = 'json',
    isDisplayLanguage = true,
    onCodeChange,
}: CodeDisplayProps) => {
    const { handleNotification } = useMainContext();

    const [isEditing, setIsEditing] = useState(false);
    const [editedCode, setEditedCode] = useState(code);
    const [isExpanded, setIsExpanded] = useState(expanded);

    const codeCardStyle: CSSProperties = {
        backgroundColor: '#f0f0f0',
        border: '1px solid #e0e0e0',
    };

    const preStyle: CSSProperties = {
        overflow: 'auto',
        transition: 'max-height 0.3s ease-in-out',
        maxHeight: isExpanded ? 'none' : maxHeight,
    };

    useEffect(() => {
        handleFormat(code);
    }, [code]);

    const highlightJSON = (jsonString: string) => {
        return jsonString
            .replace(/("([^"\\]|\\.)*")\s*:/g, '<span class="text-blue-600 font-medium">$1</span>:')
            .replace(/:\s*("([^"\\]|\\.)*")/g, ': <span class="text-green-600">$1</span>')
            .replace(
                /:\s*(true|false|null)/g,
                ': <span class="text-purple-600 font-medium">$1</span>',
            )
            .replace(/:\s*(\d+\.?\d*)/g, ': <span class="text-orange-600 font-medium">$1</span>')
            .replace(/([{}[\],])/g, '<span class="text-gray-700 font-bold">$1</span>');
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(editedCode);

            handleNotification({
                duration: 2,
                message: 'Code copied to clipboard!',
            });
        } catch (err) {
            handleNotification({
                duration: 2,
                type: NotificationType.ERROR,
                message: 'Failed to copy code',
            });
        }
    };

    const handleFormat = (currentCode: string, isOnCodeChange = false) => {
        switch (language) {
            case 'json': {
                try {
                    const parsed = JSON.parse(currentCode);
                    const formattedCode = JSON.stringify(parsed, null, 2);
                    setEditedCode(formattedCode);
                    if (isOnCodeChange) onCodeChange?.(formattedCode);
                } catch (e) {
                    setEditedCode(currentCode);
                    if (isOnCodeChange) onCodeChange?.(currentCode);
                }
                break;
            }

            case 'javascript': {
                const formattedCode = jsBeautify.js_beautify(currentCode, JS_BEAUTIFY_OPTIONS);
                setEditedCode(formattedCode);
                if (isOnCodeChange) onCodeChange?.(formattedCode);
                break;
            }

            case 'html': {
                const formattedCode = jsBeautify.html_beautify(currentCode, HTML_BEAUTIFY_OPTIONS);
                setEditedCode(formattedCode);
                if (isOnCodeChange) onCodeChange?.(formattedCode);
                break;
            }
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        handleFormat(editedCode);
    };

    const handleSave = () => {
        setIsEditing(false);
        handleFormat(editedCode, true);
    };

    const renderActions = () => {
        if (compareCode) return <></>;

        return (
            <div className="flex flex-wrap items-center gap-1">
                <CustomButton
                    type="text"
                    size="small"
                    onClick={handleCopy}
                    icon={<CopyOutlined />}
                    className="text-xs text-gray-600 px-1.5"
                    title="Sao chép mã"
                >
                    <span className="hidden sm:inline">Sao chép</span>
                </CustomButton>

                <CustomButton
                    type="text"
                    size="small"
                    disabled={isEditing}
                    className="text-xs text-gray-600 px-1.5"
                    onClick={() => setIsExpanded(!isExpanded)}
                    icon={isExpanded ? <CompressOutlined /> : <ExpandAltOutlined />}
                    title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                >
                    <span className="hidden sm:inline">{isExpanded ? 'Thu gọn' : 'Mở rộng'}</span>
                </CustomButton>

                <CustomButton
                    type="text"
                    size="small"
                    icon={<FormatPainterOutlined />}
                    className="text-xs text-gray-600 px-1.5"
                    onClick={() => handleFormat(editedCode)}
                    disabled={!isEditing || language !== 'json'}
                    title="Định dạng mã"
                >
                    <span className="hidden sm:inline">Định dạng</span>
                </CustomButton>

                <CustomButton
                    type="text"
                    size="small"
                    className="text-xs text-gray-600 px-1.5"
                    onClick={isEditing ? handleSave : handleEdit}
                    icon={isEditing ? <CheckOutlined /> : <EditOutlined />}
                    title={isEditing ? 'Lưu' : 'Chỉnh sửa'}
                >
                    <span className="hidden sm:inline">{isEditing ? 'Lưu' : 'Chỉnh sửa'}</span>
                </CustomButton>
            </div>
        );
    };

    const renderLanguage = () => {
        if (!isDisplayLanguage) return <></>;

        return (
            <CustomSpace className="shrink-0">
                {processingTime && (
                    <>
                        <CustomTypography.Text
                            type="secondary"
                            className="text-xs font-medium uppercase"
                        >
                            Thời gian
                        </CustomTypography.Text>
                        <CustomBadge
                            color="#52c41a"
                            count={`${processingTime ? (processingTime / 1000).toFixed(2) : 0}s`}
                        />
                        <div className="text-xs text-gray-600 p-0 m-0">|</div>
                    </>
                )}

                <CustomTypography.Text type="secondary" className="text-xs font-medium uppercase">
                    {language}
                </CustomTypography.Text>
            </CustomSpace>
        );
    };

    const renderInput = () => {
        if (!isEditing) {
            return (
                <pre
                    style={preStyle}
                    className="m-0 font-mono text-sm leading-normal whitespace-pre-wrap break-words overflow-x-auto max-w-full"
                >
                    <code
                        className="text-gray-700"
                        dangerouslySetInnerHTML={{
                            __html:
                                language === 'json'
                                    ? highlightJSON(editedCode)
                                    : editedCode
                                          .replace(/&/g, '&amp;')
                                          .replace(/</g, '&lt;')
                                          .replace(/>/g, '&gt;')
                                          .replace(/"/g, '&quot;')
                                          .replace(/'/g, '&#039;'),
                        }}
                    />
                </pre>
            );
        }

        switch (language) {
            case 'javascript':
                return (
                    <CustomMonacoEditor
                        language="javascript"
                        editedCode={editedCode}
                        onCodeChange={(value) => setEditedCode(value)}
                    />
                );

            case 'json':
                return (
                    <CustomInput.TextArea
                        allowClear
                        value={editedCode}
                        className="font-mono text-sm"
                        onClear={() => setEditedCode('')}
                        autoSize={{ minRows: 4, maxRows: 20 }}
                        onChange={(e) => setEditedCode(e.target.value)}
                    />
                );

            case 'html':
                return (
                    <CustomMonacoEditor
                        language="html"
                        editedCode={editedCode}
                        onCodeChange={(value) => setEditedCode(value)}
                    />
                );
        }
    };

    const renderTitle = () => {
        return (
            <>
                <CustomDivider className="!mt-2 !mb-2" />
                {!!title && (
                    <div className="mb-2">
                        <CustomTypography.Text className="text-sm font-medium">{`${title}:`}</CustomTypography.Text>
                    </div>
                )}
            </>
        );
    };

    return (
        <section className="w-full max-w-full overflow-hidden">
            <CustomCard style={codeCardStyle} loading={loading} className="[&_.ant-card-body]:!p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    {renderActions()}
                    {renderLanguage()}
                </div>

                {renderTitle()}

                {compareCode ? (
                    <>
                        <div className="flex justify-between items-center mb-2">
                            <CustomTag color="#2db7f5">{`Version ${compareVersion}`}</CustomTag>
                            <CustomTag color="#f50">Current version</CustomTag>
                        </div>

                        <ReactDiffViewer
                            splitView={true}
                            showDiffOnly={true}
                            extraLinesSurroundingDiff={0}
                            oldValue={jsBeautify.js_beautify(code, JS_BEAUTIFY_OPTIONS)}
                            newValue={jsBeautify.js_beautify(compareCode, JS_BEAUTIFY_OPTIONS)}
                        />
                    </>
                ) : (
                    renderInput()
                )}
            </CustomCard>
        </section>
    );
};
