import React, { type ReactNode } from "react";
import { Upload, message, Typography } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadChangeParam } from "antd/es/upload";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
interface CommonFileUploadProps {
    accept?: string;
    maxSizeMB?: number;
    fileList?: UploadFile[];
    onChange?: (fileList: UploadFile[]) => void;
    listType?: UploadProps["listType"];
    icon?: ReactNode;
    label?: string;
    helperText?: string;
    height?: number;
    maxCount?: number;
    multiple?: boolean;
    value: UploadFile[];
}
export const CommonFileUpload: React.FC<CommonFileUploadProps> = ({
    accept,
    maxSizeMB = 10,
    value,
    fileList,
    onChange,
    listType = "picture",
    icon,
    label = "Kéo thả hoặc click để tải file",
    helperText,
    height = 200,
    maxCount = 1,
    multiple = false,
}) => {
    const internalFileList = value || fileList || [];
    const beforeUpload = (file: UploadFile) => {
        const isLtSize = (file.size || 0) / 1024 / 1024 < maxSizeMB;
        if (!isLtSize) {
            message.error(`File quá lớn! Dung lượng tối đa là ${maxSizeMB}MB.`);
            return Upload.LIST_IGNORE;
        }
        if (internalFileList.length >= maxCount) {
            message.warning(`Chỉ được phép tải lên tối đa ${maxCount} file!`);
            return Upload.LIST_IGNORE;
        }
        return false;
    };
    const handleChange: UploadProps["onChange"] = (info: UploadChangeParam) => {
        let newFileList = [...info.fileList];
        if (maxCount === 1) {
            newFileList = newFileList.slice(-1);
        } else {
            newFileList = newFileList.slice(0, maxCount);
        }
        newFileList = newFileList.map((file) => {
            if (file.response) {
                file.url = file.response.url;
            }
            return file;
        });
        if (onChange) {
            onChange(newFileList);
        }
    };
    return (
        <Upload.Dragger
            name="file"
            multiple={multiple}
            maxCount={maxCount}
            listType={listType}
            accept={accept}
            fileList={internalFileList}
            beforeUpload={beforeUpload}
            onChange={handleChange}
            showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
            className="bg-gray-50/50 hover:bg-gray-100 transition-colors border-gray-300 [&_.ant-upload-list-item-container]:w-full"
            height={height}
            style={{ padding: 10 }}
        >
            {internalFileList.length >= maxCount && listType === "picture-card" ? null : (
                <div className="py-2 px-2">
                    <p className="ant-upload-drag-icon mb-2">
                        {icon || <InboxOutlined className="text-gray-400 text-3xl" />}
                    </p>
                    <p className="ant-upload-text font-medium text-gray-600 text-sm">
                        {label}
                    </p>
                    {helperText && (
                        <Typography.Text type="secondary" className="text-xs mt-1 block">
                            {helperText}
                        </Typography.Text>
                    )}
                </div>
            )}
        </Upload.Dragger>
    );
};