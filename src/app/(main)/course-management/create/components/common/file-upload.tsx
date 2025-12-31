import React, { useState } from "react";
import { Upload, App } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadChangeParam } from "antd/es/upload";
import type { UploadFile, UploadProps, RcFile } from "antd/es/upload/interface";

import type {
  TUploadApiCall,
  IUploadResponse,
} from "../../../common/types/api-response";

interface FileUploadProps {
  accept?: string;
  value?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  maxSizeMB?: number;
  maxCount?: number;
  multiple?: boolean;
  listType?: UploadProps["listType"];
  useDragger?: boolean;
  apiCall?: TUploadApiCall;
  disabled?: boolean;
}

interface CustomRequestOptions {
  file: string | Blob | RcFile | File;
  onSuccess?: (body: object, xhr?: XMLHttpRequest) => void;
  onError?: (event: Error | object, body?: object) => void;
}

interface UploadApiFunction {
  (file: File): Promise<{ data: IUploadResponse } | IUploadResponse>;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  value,
  onChange,
  maxSizeMB,
  maxCount = 1,
  multiple = false,
  listType = "text",
  useDragger = false,
  apiCall,
  disabled = false,
}) => {
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);

  const internalFileList = value || [];

  const beforeUpload = (file: RcFile) => {
    if (maxSizeMB && file.size / 1024 / 1024 > maxSizeMB) {
      message.error(`Dung lượng tối đa ${maxSizeMB}MB`);
      return Upload.LIST_IGNORE;
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
      const res = await (apiCall as UploadApiFunction)(file);
      const serverData: IUploadResponse =
        "data" in res ? (res.data as IUploadResponse) : res;

      onSuccess?.(serverData);
      message.success("Upload thành công");
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error("Upload failed"));
      message.error("Upload thất bại");
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

  const uploadProps: UploadProps = {
    name: "file",
    accept,
    multiple,
    maxCount,
    listType,
    fileList: internalFileList,
    beforeUpload,
    onChange: handleChange,
    customRequest: handleCustomRequest as any,
    showUploadList: { showRemoveIcon: !disabled },
    disabled: uploading || disabled,
  };

  const content = useDragger ? (
    <Upload.Dragger {...uploadProps}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined className="text-gray-400 text-3xl" />
      </p>
      <p className="ant-upload-text">Kéo thả hoặc bấm để tải</p>
    </Upload.Dragger>
  ) : (
    <Upload {...uploadProps}>
      <button
        type="button"
        className="px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 text-sm text-gray-700 transition-colors"
        disabled={uploading || disabled}
      >
        {uploading ? "Đang tải..." : "Chọn file"}
      </button>
    </Upload>
  );

  return content;
};
