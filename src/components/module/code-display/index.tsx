import { Divider, Flex, Tag } from 'antd';

import {
    CheckOutlined,
    CompressOutlined,
    CopyOutlined,
    EditOutlined,
    ExpandAltOutlined,
    FormatPainterOutlined,
} from '@ant-design/icons';
import { Badge, Button, Card, Input, Space, Typography } from 'antd';
import * as jsBeautify from 'js-beautify';
import dynamic from 'next/dynamic';
import { CSSProperties, FC, memo, useEffect, useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { useMainContext } from '@/contexts/MainContext';

const CustomMonacoEditor = dynamic(() => import('./custom-monaco-editor'), {
    ssr: false,
});

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
    indent_size: 2, // Number of spaces for each indentation level
    indent_char: ' ', // Character used for indentation (space)
    max_preserve_newlines: 2, // Maximum number of empty lines to preserve
    preserve_newlines: true, // Preserve empty lines
    keep_array_indentation: false, // Don't preserve array indentation
    break_chained_methods: false, // Don't break line between chained methods
    brace_style: 'collapse', // Brace style (collapse: closing brace on same line)
    space_before_conditional: true, // Add space before conditional
    unescape_strings: false, // Don't convert escape characters in strings
    jslint_happy: false, // Don't follow jslint rules
    end_with_newline: true, // End file with newline
    wrap_line_length: 0, // No line length limit
    comma_first: false, // Don't put comma at start of line
    e4x: false, // No E4X support
    indent_empty_lines: false, // Don't indent empty lines
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

const CodeDisplay: FC<CodeDisplayProps> = ({
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
}) => {
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
                type: 'error',
                duration: 2,
                message: 'Failed to copy code',
            });
        }
    };

    const handleFormat = (currentCode: string, isOnCodeChange = false) => {
        switch (language) {
            case 'json': {
                const parsed = JSON.parse(currentCode);
                const formattedCode = JSON.stringify(parsed, null, 2);

                setEditedCode(formattedCode);
                if (isOnCodeChange) onCodeChange?.(formattedCode);

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

    const renderLanguage = () => {
        if (!isDisplayLanguage) return <></>;

        return (
            <Space>
                {processingTime && (
                    <>
                        <Typography.Text type="secondary" className="text-sm font-medium uppercase">
                            Thời gian xử lý
                        </Typography.Text>
                        <Badge
                            color="#52c41a"
                            count={`${processingTime ? (processingTime / 1000).toFixed(2) : 0}s`}
                        />
                        <div className="text-sm text-gray-600 p-0 m-0">|</div>
                    </>
                )}

                <Typography.Text type="secondary" className="text-sm font-medium uppercase">
                    {language}
                </Typography.Text>
                <Badge count={editedCode.split('\n').length} />
            </Space>
        );
    };

    const renderActions = () => {
        if (compareCode) return <></>;

        return (
            <Space size={4}>
                <Button
                    type="text"
                    size="small"
                    onClick={handleCopy}
                    icon={<CopyOutlined />}
                    className="text-sm text-gray-600"
                >
                    Sao chép
                </Button>

                <Button
                    type="text"
                    size="small"
                    disabled={isEditing}
                    className="text-sm text-gray-600"
                    onClick={() => setIsExpanded(!isExpanded)}
                    icon={isExpanded ? <CompressOutlined /> : <ExpandAltOutlined />}
                >
                    {isExpanded ? 'Thu gọn' : 'Mở rộng'}
                </Button>

                <Button
                    type="text"
                    size="small"
                    icon={<FormatPainterOutlined />}
                    className="text-sm text-gray-600"
                    onClick={() => handleFormat(editedCode)}
                    disabled={!isEditing || language !== 'json'}
                >
                    Định dạng
                </Button>

                <Button
                    type="text"
                    size="small"
                    className="text-sm text-gray-600"
                    onClick={isEditing ? handleSave : handleEdit}
                    icon={isEditing ? <CheckOutlined /> : <EditOutlined />}
                >
                    {isEditing ? 'Lưu' : 'Chỉnh sửa'}
                </Button>
            </Space>
        );
    };

    const renderInput = () => {
        if (!isEditing) {
            return (
                <pre
                    style={preStyle}
                    className="m-0 font-mono text-sm leading-normal whitespace-pre-wrap break-words"
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
                    <Input.TextArea
                        value={editedCode}
                        className="font-mono text-sm"
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
                <Divider className="!mt-2" />
                <div className="mb-3">
                    {!!title && (
                        <Typography.Text className="text-sm font-medium mb-2">{`${title}:`}</Typography.Text>
                    )}
                </div>
            </>
        );
    };

    return (
        <section className="w-full">
            <Card style={codeCardStyle} loading={loading}>
                <Flex justify={compareCode ? 'end' : 'space-between'} align="center">
                    {renderActions()}
                    {renderLanguage()}
                </Flex>

                {renderTitle()}

                {compareCode ? (
                    <>
                        <Flex justify="space-between" align="center" className="mb-2">
                            <Tag color="#2db7f5">{`Version ${compareVersion}`}</Tag>
                            <Tag color="#f50">Current version</Tag>
                        </Flex>

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
            </Card>
        </section>
    );
};

export default memo(CodeDisplay);
