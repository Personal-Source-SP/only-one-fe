'use client';

import { Upload, UploadProps } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';

export type CustomUploadProps = UploadProps;

export type { UploadFile };

export const CustomUpload = Object.assign((props: CustomUploadProps) => <Upload {...props} />, {
    Dragger: Upload.Dragger,
});
