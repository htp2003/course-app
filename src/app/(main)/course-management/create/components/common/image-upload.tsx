import React, { useEffect, useState } from "react";
import { Upload, App, Image as AntImage, Typography } from "antd";
import { PlusOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import type { UploadChangeParam } from "antd/es/upload";
import type { UploadFile, RcFile } from "antd/es/upload/interface";
import ImgCrop from "antd-img-crop";

import { ASPECT_RATIO_TOLERANCE } from "../../../common/constants/constants";
import type {
  TUploadApiCall,
  IUploadResponse,
} from "../../../common/types/api-response";

interface ImageUploadProps {
  accept?: string;
  value?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  aspectRatio?: number;
  checkRatio?: boolean;
  enableCrop?: boolean;
  maxSizeMB?: number;
  apiCall?: TUploadApiCall;
  disabled?: boolean;
  helperText?: string;
  label?: string;
  icon?: React.ReactNode;
  height?: number;
  width?: number;
  placeholderSize?: number;
}

interface CustomRequestOptions {
  file: string | Blob | RcFile | File;
  onSuccess?: (body: object, xhr?: XMLHttpRequest) => void;
  onError?: (event: Error | object, body?: object) => void;
}

interface UploadApiFunction {
  (file: File): Promise<{ data: IUploadResponse } | IUploadResponse>;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  accept = "image/png, image/jpeg, image/jpg, image/webp",
  value,
  onChange,
  aspectRatio,
  checkRatio = false,
  enableCrop = false,
  maxSizeMB,
  apiCall,
  disabled = false,
  helperText,
  label = "Kéo thả hoặc click để tải ảnh",
  icon,
  height = 200,
  width,
  placeholderSize = 140,
}) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { message } = App.useApp();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);

  const internalFileList = value || [];
  const singleFile = internalFileList[0];
  const hasFile = internalFileList.length > 0;

  const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  useEffect(() => {
    if (hasFile && singleFile) {
      if (singleFile.url) {
        setImageUrl(singleFile.url);
      } else if (singleFile.originFileObj) {
        getBase64(singleFile.originFileObj as RcFile).then(setImageUrl);
      } else if (singleFile.thumbUrl) {
        setImageUrl(singleFile.thumbUrl);
      } else if (singleFile.response) {
        const resp = singleFile.response as IUploadResponse;
        const url =
          resp.uri ||
          resp.url ||
          (resp as any).rawUrl ||
          (resp as any).compressUrl ||
          "";
        if (url) setImageUrl(url);
      }
    } else {
      setImageUrl("");
    }
  }, [singleFile, hasFile]);

  const checkImageRatio = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const ratio = img.width / img.height;
        const isValid = aspectRatio
          ? Math.abs(ratio - aspectRatio) < ASPECT_RATIO_TOLERANCE
          : true;
        if (!isValid) {
          message.error(`Tỷ lệ ảnh không hợp lệ (${aspectRatio?.toFixed(2)})`);
          reject(new Error("Invalid ratio"));
        } else {
          resolve(true);
        }
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => reject(new Error("Failed to load"));
    });
  };

  const beforeUpload = async (file: RcFile) => {
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

    if (!enableCrop && checkRatio && aspectRatio) {
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
    if (!(file instanceof File) || !apiCall) return;

    setLoading(true);

    try {
      const res = await (apiCall as UploadApiFunction)(file);
      const serverData: IUploadResponse =
        "data" in res ? (res.data as IUploadResponse) : res;

      const uploadedUrl =
        serverData.uri ||
        serverData.url ||
        (serverData as any).rawUrl ||
        (serverData as any).compressUrl ||
        "";

      const newFileList = [
        {
          uid: "-1",
          name: file.name,
          status: "done" as const,
          url: uploadedUrl,
          response: serverData,
        },
      ];

      onChange?.(newFileList);
      onSuccess?.(serverData);
      message.success("Upload thành công");
    } catch (error: any) {
      // Clear file immediately on error
      onChange?.([]);
      setImageUrl("");
      setLoading(false);

      const isAuthError = error?.response?.status === 401;
      if (isAuthError) {
        message.error("Phiên đăng nhập hết hạn");
      } else {
        message.error("Upload thất bại");
      }
      onError?.(error instanceof Error ? error : new Error("Upload failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (info: UploadChangeParam) => {
    let newFileList = [...info.fileList];
    if (newFileList.length > 1) newFileList = newFileList.slice(-1);

    // Filter out error files and stuck uploading files
    newFileList = newFileList.filter((file) => {
      // Remove error files
      if (file.status === "error") return false;
      // Remove uploading files that failed (no response after error)
      if (file.status === "uploading" && info.file.status === "error")
        return false;
      return true;
    });

    newFileList = newFileList.map((file) => {
      if (file.response) {
        const resp = file.response as IUploadResponse;
        file.url = resp.uri || resp.url || file.url;
      }
      return file;
    });
    onChange?.(newFileList);
  };

  const handlePreview = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (imageUrl) setPreviewOpen(true);
  };

  const uploadComponent = imageUrl ? (
    <Upload.Dragger
      name="file"
      listType="picture"
      maxCount={1}
      accept={accept}
      showUploadList={false}
      customRequest={handleCustomRequest as any}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      fileList={internalFileList}
      disabled={loading || disabled}
      className="!p-0 overflow-hidden [&_.ant-upload-drag-container]:!p-0 !border-none !bg-transparent"
      style={{
        height,
        width: width || "100%",
        maxWidth: width,
      }}
    >
      <div className="relative w-full h-full group">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="upload"
            className="w-full h-full object-cover rounded-lg"
          />
        )}

        {!disabled && (
          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-10 rounded-lg">
            <EyeOutlined
              className="text-white text-xl cursor-pointer hover:scale-110"
              onClick={handlePreview}
            />
            <DeleteOutlined
              className="text-white text-xl cursor-pointer hover:text-red-400 hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                onChange?.([]);
                setImageUrl("");
              }}
            />
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-20 text-sm text-gray-600">
            Đang tải...
          </div>
        )}
      </div>
    </Upload.Dragger>
  ) : (
    <Upload
      name="file"
      listType="picture-card"
      maxCount={1}
      accept={accept}
      showUploadList={false}
      customRequest={handleCustomRequest as any}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      fileList={internalFileList}
      disabled={loading || disabled}
      style={{ width: placeholderSize, height: placeholderSize }}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-1">
        {icon || <PlusOutlined />}
        <div className="text-xs text-gray-600 text-center px-1">{label}</div>
        {helperText && (
          <Typography.Text
            type="secondary"
            className="text-[11px] leading-tight text-center px-2"
          >
            {helperText}
          </Typography.Text>
        )}
      </div>
    </Upload>
  );

  const previewNode = imageUrl ? (
    <AntImage
      src={imageUrl}
      style={{ display: "none" }}
      preview={{
        visible: previewOpen,
        onVisibleChange: setPreviewOpen,
      }}
    />
  ) : null;

  if (enableCrop && aspectRatio) {
    return (
      <>
        <ImgCrop
          rotationSlider
          aspect={aspectRatio}
          showGrid
          modalTitle="Chỉnh sửa ảnh"
          modalOk="OK"
          modalCancel="Hủy"
        >
          {uploadComponent}
        </ImgCrop>
        {previewNode}
      </>
    );
  }

  return (
    <>
      {uploadComponent}
      {previewNode}
    </>
  );
};
