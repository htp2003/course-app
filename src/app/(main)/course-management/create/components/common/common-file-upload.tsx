import React, { type ReactNode, useState } from "react";
import { Upload, App, Typography } from "antd";
import { InboxOutlined, LoadingOutlined } from "@ant-design/icons";
import type { UploadChangeParam } from "antd/es/upload";
import type { UploadFile, UploadProps, RcFile } from "antd/es/upload/interface";
import { ASPECT_RATIO_TOLERANCE } from "../../../common/constants/constants";
import type {
  TUploadApiCall,
  IUploadResponse,
} from "../../../common/types/api-response";

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
  value?: UploadFile[];
  aspectRatio?: number;
  checkRatio?: boolean;
  apiCall?: TUploadApiCall;
}

interface CustomRequestOptions {
  file: string | Blob | RcFile | File;
  onSuccess?: (body: object, xhr?: XMLHttpRequest) => void;
  onError?: (event: Error | object, body?: object) => void;
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
  aspectRatio,
  checkRatio = false,
  apiCall,
}) => {
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);

  const checkImageRatio = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const ratio = width / height;
        const isValid = aspectRatio
          ? Math.abs(ratio - aspectRatio) < ASPECT_RATIO_TOLERANCE
          : true;

        if (!isValid && aspectRatio) {
          const targetRatioText =
            aspectRatio === 1
              ? "1:1"
              : aspectRatio === 16 / 9
              ? "16:9"
              : aspectRatio.toFixed(2);
          message.error(`Ảnh sai tỉ lệ! Yêu cầu: ${targetRatioText}.`);
          reject(Upload.LIST_IGNORE);
        } else {
          resolve(true);
        }
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        message.error("Lỗi đọc file ảnh!");
        reject(Upload.LIST_IGNORE);
      };
    });
  };

  const internalFileList = value || fileList || [];

  const beforeUpload = async (file: RcFile) => {
    if (accept) {
      const allowedTypes = accept.split(",").map((t) => t.trim().toLowerCase());
      const fileType = (file.type || "").toLowerCase();
      const fileName = (file.name || "").toLowerCase();
      const isValidType = allowedTypes.some((type) => {
        if (type.includes("/"))
          return type.endsWith("/*")
            ? fileType.startsWith(type.split("/")[0])
            : fileType === type;
        return type.startsWith(".") ? fileName.endsWith(type) : false;
      });
      if (!isValidType) {
        message.error(`Định dạng không hợp lệ! Chỉ nhận: ${accept}`);
        return Upload.LIST_IGNORE;
      }
    }

    const isLtSize = (file.size || 0) / 1024 / 1024 < maxSizeMB;
    if (!isLtSize) {
      message.error(`File quá lớn! Tối đa ${maxSizeMB}MB.`);
      return Upload.LIST_IGNORE;
    }

    if (internalFileList.length >= maxCount) {
      message.warning(`Tối đa ${maxCount} file!`);
      return Upload.LIST_IGNORE;
    }

    if (checkRatio && aspectRatio && file.type?.startsWith("image/")) {
      try {
        await checkImageRatio(file);
      } catch {
        return Upload.LIST_IGNORE;
      }
    }
    return true;
  };

  const handleCustomRequest = async (options: CustomRequestOptions) => {
    const { file, onSuccess, onError } = options;
    if (!(file instanceof File)) return;

    if (!apiCall) {
      onSuccess?.({});
      return;
    }

    setUploading(true);
    try {
      const res = await apiCall(file);

      let serverData: IUploadResponse;
      if (
        "data" in res &&
        typeof res.data === "object" &&
        res.data !== null &&
        "id" in res.data
      ) {
        serverData = res.data as IUploadResponse;
      } else {
        serverData = res as IUploadResponse;
      }

      onSuccess?.(serverData);
      message.success("Upload thành công!");
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error("Upload error"));
      message.error("Upload thất bại, vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const handleChange: UploadProps["onChange"] = (info: UploadChangeParam) => {
    let newFileList = [...info.fileList];
    if (maxCount === 1) newFileList = newFileList.slice(-1);
    else newFileList = newFileList.slice(0, maxCount);

    newFileList = newFileList.map((file) => {
      if (file.response) {
        const resp = file.response as IUploadResponse;
        file.url = resp.uri || resp.url || file.url;
      }
      return file;
    });

    onChange?.(newFileList);
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
      customRequest={handleCustomRequest as UploadProps["customRequest"]}
      className="bg-gray-50/50 hover:bg-gray-100 transition-colors border-gray-300 [&_.ant-upload-list-item-container]:w-full"
      height={height}
      style={{ padding: 10 }}
      disabled={uploading}
    >
      {internalFileList.length >= maxCount &&
      listType === "picture-card" ? null : (
        <div className="py-2 px-2">
          <p className="ant-upload-drag-icon mb-2">
            {uploading ? (
              <LoadingOutlined className="text-blue-500 text-3xl" />
            ) : (
              icon || <InboxOutlined className="text-gray-400 text-3xl" />
            )}
          </p>
          <p className="ant-upload-text font-medium text-gray-600 text-sm">
            {uploading ? "Đang xử lý..." : label}
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
