import { Card, Typography } from 'antd';
import { CSSProperties } from 'react';

type CommentDisplayProps = {
  title: string;
  comments: { label: string; code: string }[];
};

const cardStyle: CSSProperties = {
  backgroundColor: '#f0f0f0',
  border: '1px solid #e0e0e0',
};

const CommentDisplay = ({ title, comments }: CommentDisplayProps) => {
  return (
    <div className="mb-2">
      <Card style={cardStyle}>
        <Typography.Text strong className="block mb-1">
          {title}
        </Typography.Text>

        {comments.map((comment, index) => (
          <div key={index} className="mb-2">
            <Typography.Text className="block text-sm font-medium mb-1">{comment.label}</Typography.Text>
            <pre className="bg-white rounded px-2 py-1 text-xs font-mono whitespace-pre-wrap break-words border border-gray-200">
              {comment.code}
            </pre>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default CommentDisplay;
