import { memo, useCallback } from "react";
import {
  Form,
  Input,
  Row,
  Col,
  Button,
  Tooltip,
  Radio,
  Popconfirm,
  App,
  Card,
} from "antd";
import {
  DeleteOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  DesktopOutlined,
} from "@ant-design/icons";
import { LESSON_TYPES } from "../../../common/constants/constants";
import {
  UPLOAD_CONFIG,
  ASPECT_RATIOS,
} from "../../../common/constants/constants";
import { normFile } from "../../../common/utils/utils";
import { FileUpload } from "../common/file-upload";
import { ChunkFileUpload } from "../common/chunk-file-upload";
import type {
  ICreateCourseForm,
  LessonTypeType,
} from "../../../common/types/types";
import type { ReactNode } from "react";

import { uploadDocumentAPI, uploadVideoChunkAPI } from "../../services/api";

interface ILessonUploadConfig {
  field: string;
  label: string;
  maxCount: number;
  MAX_SIZE_MB: number;
  ACCEPT: string;
  HELPER_TEXT: string;
  icon: ReactNode;
  checkRatio?: boolean;
  aspectRatio?: number;
  apiCall?: (file: File) => Promise<{ data: { id: number; uri: string } }>;
}

const getUploadConfig = (type: LessonTypeType): ILessonUploadConfig | null => {
  if (type === "slide")
    return {
      ...UPLOAD_CONFIG.SLIDE,
      field: "slideFile",
      label: "Slide bài giảng",
      maxCount: 1,
      icon: <DesktopOutlined className="text-2xl text-blue-500" />,
      apiCall: uploadDocumentAPI,
    };
  if (type === "document")
    return {
      ...UPLOAD_CONFIG.DOCUMENT,
      field: "docFile",
      label: "Tài liệu chính",
      maxCount: 1,
      icon: <FileTextOutlined className="text-2xl text-green-500" />,
      apiCall: uploadDocumentAPI,
    };
  if (type === "video")
    return {
      ...UPLOAD_CONFIG.VIDEO,
      field: "videoFile",
      label: "Video bài giảng",
      maxCount: 1,
      icon: <VideoCameraOutlined className="text-2xl text-red-500" />,
      checkRatio: true,
      aspectRatio: ASPECT_RATIOS.VIDEO,
      apiCall: uploadVideoChunkAPI,
    };
  return null;
};

interface Props {
  fieldKey: number;
  chapterIndex: number;
  lessonIndex: number;
  remove: (index: number | number[]) => void;
  totalLessons: number;
  isPreview?: boolean;
}

export const LessonItem = memo(
  ({
    chapterIndex,
    lessonIndex,
    remove,
    totalLessons,
    isPreview = false,
  }: Props) => {
    const { message } = App.useApp();

    const onRemoveLesson = useCallback(() => {
      if (totalLessons <= 1) {
        message.warning("Không thể xóa bài học cuối cùng trong chương!");
        return;
      }
      remove(lessonIndex);
    }, [remove, lessonIndex, totalLessons, message]);

    const handleTypeChange = useCallback(() => {}, []);

    return (
      <Card
        title={`Bài học ${lessonIndex + 1}`}
        extra={
          !isPreview && (
            <Popconfirm
              title="Xác nhận xóa bài học"
              description="Bạn có chắc muốn xóa bài học này?"
              onConfirm={onRemoveLesson}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              disabled={totalLessons <= 1}
            >
              <Tooltip
                title={
                  totalLessons <= 1 ? "Không thể xóa bài học cuối cùng" : ""
                }
              >
                <Button
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  className="bg-white/80 backdrop-blur-sm border border-red-100 shadow-sm "
                  disabled={totalLessons <= 1}
                />
              </Tooltip>
            </Popconfirm>
          )
        }
        className="group relative bg-slate-50 rounded-xl border border-slate-200 p-4 mb-4 hover:border-blue-300 hover:shadow-md transition-all duration-300"
      >
        <div className="mb-4 pl-2">
          <Row gutter={[16, 16]} align="middle">
            <Col span={24}>
              <Form.Item
                label="Tên bài học"
                colon={false}
                labelCol={{ span: 24 }}
                name={[lessonIndex, "title"]}
                rules={
                  isPreview
                    ? []
                    : [
                        { required: true, message: "Nhập tên" },
                        {
                          validator: (_, value) => {
                            if (value && !value.trim()) {
                              return Promise.reject(
                                new Error("Vui lòng nhập tên bài học hợp lệ")
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]
                }
                className="mb-0"
              >
                <Input
                  placeholder="Nhập tên bài học..."
                  className="font-medium text-slate-700 hover:bg-white focus:bg-white bg-transparent border-t-0 border-x-0 border-b border-slate-300 rounded-none px-0 shadow-none focus:shadow-none focus:border-blue-500"
                  disabled={isPreview}
                  onBlur={(e) => {
                    e.target.value = e.target.value.trim();
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Hình thức học"
                colon={false}
                labelCol={{ span: 24 }}
                name={[lessonIndex, "type"]}
                initialValue="video"
                className="mb-0"
                rules={
                  isPreview
                    ? []
                    : [{ required: true, message: "Chọn loại nội dung" }]
                }
              >
                <Radio.Group
                  className="w-full"
                  onChange={handleTypeChange}
                  disabled={isPreview}
                >
                  {LESSON_TYPES.map((item) => (
                    <Radio key={item.value} value={item.value}>
                      {item.label}
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className="bg-white rounded-lg border border-slate-100 p-3 shadow-sm">
          <Row gutter={[0, 24]}>
            <Col span={24} className="border-b border-slate-100 pb-6">
              <Form.Item
                noStyle
                shouldUpdate={(
                  prev: ICreateCourseForm,
                  curr: ICreateCourseForm
                ) => {
                  return (
                    prev.chapters?.[chapterIndex]?.lessons?.[lessonIndex]
                      ?.type !==
                    curr.chapters?.[chapterIndex]?.lessons?.[lessonIndex]?.type
                  );
                }}
              >
                {({ getFieldValue }) => {
                  const type = getFieldValue([
                    "chapters",
                    chapterIndex,
                    "lessons",
                    lessonIndex,
                    "type",
                  ]) as LessonTypeType;

                  const config = getUploadConfig(type);
                  if (!config) return null;

                  return (
                    <div className="h-full flex flex-col">
                      <div className="flex-1">
                        <Form.Item
                          name={[lessonIndex, config.field]}
                          getValueFromEvent={normFile}
                          className="mb-0 h-full"
                          label="Nội dung bài học chính "
                          rules={
                            isPreview
                              ? []
                              : [
                                  {
                                    required: true,
                                    message: "Vui lòng tải lên nội dung chính",
                                  },
                                ]
                          }
                        >
                          {type === "video" ? (
                            <ChunkFileUpload
                              accept={config.ACCEPT}
                              maxSizeMB={config.MAX_SIZE_MB}
                              maxCount={config.maxCount}
                              apiCall={config.apiCall}
                              height={200}
                              placeholderSize={140}
                              disabled={isPreview}
                            />
                          ) : (
                            <FileUpload
                              accept={config.ACCEPT}
                              maxSizeMB={config.MAX_SIZE_MB}
                              maxCount={config.maxCount}
                              multiple={config.maxCount > 1}
                              apiCall={config.apiCall}
                              disabled={isPreview}
                            />
                          )}
                        </Form.Item>
                      </div>
                    </div>
                  );
                }}
              </Form.Item>
            </Col>

            <Col span={24}>
              <div className="h-full flex flex-col w-full">
                <div className="flex-1 w-full">
                  <Form.Item
                    label="Tài liệu tham khảo (nếu có)"
                    name={[lessonIndex, "refDocFile"]}
                    getValueFromEvent={normFile}
                    className="mb-0 h-full w-full"
                  >
                    <FileUpload
                      accept={UPLOAD_CONFIG.DOCUMENT.ACCEPT}
                      maxSizeMB={UPLOAD_CONFIG.DOCUMENT.MAX_SIZE_MB}
                      maxCount={1}
                      apiCall={uploadDocumentAPI}
                      disabled={isPreview}
                    />
                  </Form.Item>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Card>
    );
  }
);
LessonItem.displayName = "LessonItem";
