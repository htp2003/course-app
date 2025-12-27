import React, { type ReactNode, useState, useEffect } from "react";
import {
  Upload,
  App,
  Typography,
  Image as AntImage,
  Tooltip,
  Progress,
} from "antd";
import {
  InboxOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import type { UploadChangeParam } from "antd/es/upload";
import type { UploadFile, UploadProps, RcFile } from "antd/es/upload/interface";
import ImgCrop from "antd-img-crop";

import { ASPECT_RATIO_TOLERANCE } from "../../../common/constants/constants";
import type {
  TUploadApiCall,
  IUploadResponse,
} from "../../../common/types/api-response";

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const isImageFile = (file: UploadFile) => {
  if (file.type) return file.type.startsWith("image/");
  const name = file.name || file.url || "";
  return /\.(jpg|jpeg|png|webp|gif|svg|bmp)$/i.test(name);
};

const getFileIcon = (fileName: string) => {
  if (/\.pdf$/i.test(fileName))
    return <FilePdfOutlined className="text-red-500" />;
  if (/\.(doc|docx)$/i.test(fileName))
    return <FileWordOutlined className="text-blue-500" />;
  if (/\.(xls|xlsx)$/i.test(fileName))
    return <FileExcelOutlined className="text-green-500" />;
  return <FileTextOutlined className="text-gray-500" />;
};

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
  enableCrop?: boolean;
  apiCall?: TUploadApiCall;
}

interface CustomRequestOptions {
  file: string | Blob | RcFile | File;
  onSuccess?: (body: object, xhr?: XMLHttpRequest) => void;
  onError?: (event: Error | object, body?: object) => void;
  onProgress?: (event: { percent: number }) => void;
}

interface UploadApiFunction {
  (
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<{ data: IUploadResponse } | IUploadResponse>;
}

export const CommonFileUpload: React.FC<CommonFileUploadProps> = ({
  accept,
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
  enableCrop = false,
  apiCall,
}) => {
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const internalFileList = value || fileList || [];
  const singleFile = internalFileList[0];
  const hasFile = internalFileList.length > 0;

  const isCoverMode = maxCount === 1 && hasFile && isImageFile(singleFile);
  const isSingleDocMode = maxCount === 1 && hasFile && !isImageFile(singleFile);

  const [singleImageUrl, setSingleImageUrl] = useState<string>("");

  useEffect(() => {
    if (isCoverMode && singleFile) {
      if (singleFile.url) {
        setSingleImageUrl(singleFile.url);
      } else if (singleFile.originFileObj) {
        getBase64(singleFile.originFileObj as RcFile).then(setSingleImageUrl);
      } else if (singleFile.thumbUrl) {
        setSingleImageUrl(singleFile.thumbUrl);
      }
    } else {
      setSingleImageUrl("");
    }
  }, [singleFile, isCoverMode]);

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
          reject(Upload.LIST_IGNORE);
        } else {
          resolve(true);
        }
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => reject(Upload.LIST_IGNORE);
    });
  };

  const beforeUpload = async (file: RcFile) => {
    if (internalFileList.length >= maxCount) {
      message.warning(`Tối đa ${maxCount} file!`);
      return Upload.LIST_IGNORE;
    }
    if (
      !enableCrop &&
      checkRatio &&
      aspectRatio &&
      file.type?.startsWith("image/")
    ) {
      try {
        await checkImageRatio(file);
      } catch {
        return Upload.LIST_IGNORE;
      }
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
    setProgressPercent(0);

    try {
      const res = await (apiCall as UploadApiFunction)(file, (percent) => {
        setProgressPercent(percent);
        onProgress?.({ percent });
      });

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
      message.error("Upload thất bại.");
    } finally {
      setUploading(false);
      setProgressPercent(0);
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

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.([]);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewImage(singleImageUrl);
    setPreviewOpen(true);
  };

  const UploadDraggerComponent = (
    <Upload.Dragger
      name="file"
      multiple={multiple}
      maxCount={maxCount}
      listType={listType}
      accept={accept}
      fileList={internalFileList}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      customRequest={handleCustomRequest as any}
      showUploadList={maxCount === 1 ? false : true}
      className={`
        [&_.ant-upload-list-item-container]:w-full
        ${isCoverMode
          ? "!p-0 overflow-hidden [&_.ant-upload-btn]:!p-0 [&_.ant-upload-drag-container]:!p-0 !border-none !bg-transparent"
          : "bg-gray-50/50 hover:bg-gray-100 transition-colors border-gray-300"
        }
      `}
      height={height}
      style={{ padding: isCoverMode ? 0 : 10 }}
      disabled={uploading}
    >
      {isCoverMode ? (
        <div className="relative w-full h-full group flex items-center justify-center">
          <img
            src={singleImageUrl}
            alt="preview"
            className="w-full h-full object-cover rounded-lg"
          />
          {!uploading && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-10 rounded-lg">
              <EyeOutlined
                className="text-white text-xl cursor-pointer hover:scale-110"
                onClick={handlePreview}
              />
              <DeleteOutlined
                className="text-white text-xl cursor-pointer hover:text-red-400 hover:scale-110"
                onClick={handleRemove}
              />
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-20">
              <Progress type="circle" percent={progressPercent} width={50} />
              <div className="text-xs text-blue-500 mt-2 font-medium">
                Đang tải lên...
              </div>
            </div>
          )}
        </div>
      ) : isSingleDocMode ? (
        <div className="flex flex-col items-center justify-center h-full w-full relative group p-4">
          {uploading ? (
            <div className="w-full max-w-[150px] flex flex-col items-center">
              <Progress
                type="dashboard"
                percent={progressPercent}
                size="small"
                gapDegree={75}
              />
              <div className="text-xs text-gray-500 mt-2">
                Đang xử lý video...
              </div>
            </div>
          ) : (
            <div className="text-4xl mb-2 transition-transform group-hover:scale-110">
              {getFileIcon(singleFile.name)}
            </div>
          )}

          {!uploading && (
            <>
              <div className="max-w-[80%] text-center">
                <Typography.Text
                  strong
                  className="block truncate text-gray-700 text-sm mb-1"
                  title={singleFile.name}
                >
                  {singleFile.name}
                </Typography.Text>
                <Typography.Text type="secondary" className="text-xs">
                  {singleFile.size
                    ? (singleFile.size / 1024 / 1024).toFixed(2)
                    : 0}{" "}
                  MB
                </Typography.Text>
              </div>
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip title="Xóa file">
                  <DeleteOutlined
                    className="text-gray-400 hover:text-red-500 text-lg cursor-pointer bg-white rounded-full p-1 shadow-sm border border-gray-200"
                    onClick={handleRemove}
                  />
                </Tooltip>
              </div>
              <div className="absolute bottom-2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Nhấn để thay đổi file
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="py-2 px-2 h-full flex flex-col justify-center items-center">
          <p className="ant-upload-drag-icon mb-2">
            {uploading ? (
              <Progress type="circle" percent={progressPercent} width={40} />
            ) : (
              icon || <InboxOutlined className="text-gray-400 text-3xl" />
            )}
          </p>
          <div className="ant-upload-text font-medium text-gray-600 text-sm">
            {uploading ? (
              <span>Đang tải lên {progressPercent}%...</span>
            ) : (
              label
            )}
          </div>
          {helperText && !uploading && (
            <Typography.Text type="secondary" className="text-xs mt-1 block">
              {helperText}
            </Typography.Text>
          )}
        </div>
      )}
    </Upload.Dragger>
  );

  return (
    <>
      {enableCrop && aspectRatio ? (
        <ImgCrop
          rotationSlider
          aspect={aspectRatio}
          showGrid
          modalTitle="Chỉnh sửa ảnh"
          modalOk="Xác nhận"
          modalCancel="Hủy"
          quality={0.8}
        >
          {UploadDraggerComponent}
        </ImgCrop>
      ) : (
        UploadDraggerComponent
      )}
      <AntImage
        width={200}
        style={{ display: "none" }}
        src={previewImage}
        preview={{
          visible: previewOpen,
          src: previewImage,
          onVisibleChange: (value) => setPreviewOpen(value),
        }}
      />
    </>
  );
};
