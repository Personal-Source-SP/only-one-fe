import { CustomCard, CustomTypography } from '@/components/custom';
import { CSSProperties } from 'react';

type CommentDisplayProps = {
    title: string;
    comments: { label: string; code: string }[];
};

const cardStyle: CSSProperties = {
    backgroundColor: '#f0f0f0',
    border: '1px solid #e0e0e0',
};

export const CommentDisplay = ({ title, comments }: CommentDisplayProps) => {
    return (
        <div className="mb-2">
            <CustomCard style={cardStyle}>
                <CustomTypography.Text strong className="block mb-1">
                    {title}
                </CustomTypography.Text>

                {comments.map((comment, index) => (
                    <div key={index} className="mb-2">
                        <CustomTypography.Text className="block text-sm font-medium mb-1">
                            {comment.label}
                        </CustomTypography.Text>
                        <pre className="bg-white rounded px-2 py-1 text-xs font-mono whitespace-pre-wrap break-words border border-gray-200">
                            {comment.code}
                        </pre>
                    </div>
                ))}
            </CustomCard>
        </div>
    );
};
