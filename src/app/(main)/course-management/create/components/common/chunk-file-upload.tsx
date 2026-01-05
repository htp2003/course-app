import React, { useState, useEffect } from "react";
import { Upload, App, Progress } from "antd";
import { DeleteOutlined, PlayCircleOutlined } from "@ant-design/icons";
import type { UploadChangeParam } from "antd/es/upload";
import type { UploadFile, UploadProps, RcFile } from "antd/es/upload/interface";

import type { IUploadResponse } from "../../../common/types/api-response";

export type TChunkUploadApiCall = (
  file: File,
  onProgress?: (percent: number) => void
) => Promise<{ data: IUploadResponse } | IUploadResponse>;

interface ChunkFileUploadProps {
  accept?: string;
  value?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  maxSizeMB?: number;
  maxCount?: number;
  multiple?: boolean;
  listType?: UploadProps["listType"];
  apiCall?: TChunkUploadApiCall;
  disabled?: boolean;
  placeholderSize?: number;
  height?: number;
  width?: number;
}

interface CustomRequestOptions {
  file: string | Blob | RcFile | File;
  onSuccess?: (body: object, xhr?: XMLHttpRequest) => void;
  onError?: (event: Error | object, body?: object) => void;
  onProgress?: (event: { percent: number }) => void;
}

export const ChunkFileUpload: React.FC<ChunkFileUploadProps> = ({
  accept,
  value,
  onChange,
  maxSizeMB,
  maxCount = 1,
  multiple = false,
  listType = "text",
  apiCall,
  disabled = false,
  placeholderSize = 100,
  height = 200,
  width = "50%",
}) => {
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);
  const [percent, setPercent] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string>("");

  const internalFileList = value || [];
  const singleFile = internalFileList[0];
  const hasFile = internalFileList.length > 0;

  const extractUrl = (resp: IUploadResponse): string => {
    return (
      resp.uri ||
      resp.url ||
      (resp as any).rawUrl ||
      (resp as any).compressUrl ||
      ""
    );
  };

  useEffect(() => {
    if (hasFile && singleFile) {
      if (singleFile.url) {
        setVideoUrl(singleFile.url);
      } else if (singleFile.response) {
        const url = extractUrl(singleFile.response as IUploadResponse);
        if (url) setVideoUrl(url);
      } else if (singleFile.thumbUrl) {
        setVideoUrl(singleFile.thumbUrl);
      }
    } else {
      setVideoUrl("");
    }
  }, [value, hasFile, singleFile]);

  const beforeUpload = (file: RcFile) => {
    if (accept) {
      const acceptedTypes = accept.split(",").map((t) => t.trim());
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      const isValidType = acceptedTypes.some((type) => {
        if (type.includes("/")) {
          if (type.endsWith("/*")) {
            return fileType.startsWith(type.replace("/*", "/"));
          }
          return fileType === type;
        }
        if (type.startsWith(".")) {
          return fileName.endsWith(type.toLowerCase());
        }
        return false;
      });

      if (!isValidType) {
        message.error(`Chỉ chấp nhận file: ${accept}`);
        return Upload.LIST_IGNORE;
      }
    }

    if (maxSizeMB && file.size / 1024 / 1024 > maxSizeMB) {
      message.error(`Dung lượng tối đa ${maxSizeMB}MB`);
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleCustomRequest = async (options: CustomRequestOptions) => {
    const { file, onSuccess, onError, onProgress } = options;
    if (!(file instanceof File)) return;
    if (!apiCall) {
      onSuccess?.({});
      return;
    }

    setUploading(true);
    setPercent(0);

    try {
      const res = await apiCall(file, (p) => {
        setPercent(p);
        onProgress?.({ percent: p });
      });

      let serverData: IUploadResponse;
      if ("data" in res && typeof res.data === "object" && res.data !== null) {
        serverData = res.data as IUploadResponse;
      } else {
        serverData = res as IUploadResponse;
      }

      const uploadedUrl = extractUrl(serverData);

      const newFileList: UploadFile[] = [
        {
          uid: (file as any).uid || Date.now().toString(),
          name: file.name,
          status: "done",
          url: uploadedUrl,
          response: serverData,
        },
      ];

      if (uploadedUrl) {
        setVideoUrl(uploadedUrl);
      }

      onChange?.(newFileList);
      onSuccess?.(serverData);
      message.success("Upload thành công");
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error("Upload failed"));
      message.error("Upload thất bại");
    } finally {
      setUploading(false);
      setPercent(0);
    }
  };

  const handleChange: UploadProps["onChange"] = (info: UploadChangeParam) => {
    if (info.file.status === "uploading") return;

    let newFileList = [...info.fileList];
    if (maxCount === 1) newFileList = newFileList.slice(-1);
    else newFileList = newFileList.slice(0, maxCount);

    newFileList = newFileList.map((file) => {
      if (file.response) {
        const extractedUrl = extractUrl(file.response as IUploadResponse);
        if (extractedUrl) {
          file.url = extractedUrl;
        }
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
    showUploadList: { showRemoveIcon: !uploading && !disabled },
    disabled: uploading || disabled,
  };

  if (videoUrl) {
    return (
      <div
        className="relative group border border-gray-200 rounded-lg overflow-hidden bg-black"
        style={{ height, width: width || "100%", maxWidth: width }}
      >
        <video
          src={videoUrl}
          controls
          className="w-full h-full object-contain"
          preload="metadata"
        />
        {!disabled && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onChange?.([]);
                setVideoUrl("");
              }}
            >
              <DeleteOutlined />
            </button>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
            <Progress type="circle" percent={percent} strokeColor="#1890ff" />
            <div className="text-white text-sm mt-3">
              Đang tải {percent}%...
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Upload {...uploadProps} listType={listType} showUploadList={false}>
      <button
        type="button"
        className="px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 text-sm text-gray-700 transition-colors flex items-center gap-2"
        disabled={uploading || disabled}
        style={
          typeof placeholderSize === "number"
            ? { minWidth: placeholderSize }
            : undefined
        }
      >
        {uploading ? (
          <>
            <Progress type="circle" percent={percent} width={32} />
            <span className="text-xs text-gray-600">Đang tải {percent}%</span>
          </>
        ) : (
          <>
            <PlayCircleOutlined />
            <span className="text-sm">Chọn video</span>
          </>
        )}
      </button>
    </Upload>
  );
};
