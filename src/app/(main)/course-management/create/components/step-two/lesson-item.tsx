import { memo, useCallback } from "react";
import {
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Card,
  Button,
  Tooltip,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  DesktopOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import {
  LESSON_TYPES,
  UPLOAD_CONFIG,
  ASPECT_RATIOS,
} from "../../../common/constants/constants";
import { normFile } from "../../../common/utils/utils";
import { CommonFileUpload } from "../common/common-file-upload";
import type {
  ICreateCourseForm,
  LessonTypeType,
} from "../../../common/types/types";
import type { ReactNode } from "react";

import { uploadDocumentAPI } from "../../services/api";

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
  apiCall?: (file: File) => Promise<any>;
}

const getUploadConfig = (type: LessonTypeType): ILessonUploadConfig | null => {
  if (type === "slide")
    return {
      ...UPLOAD_CONFIG.SLIDE,
      field: "slideFile",
      label: "Slide bài giảng",
      maxCount: 1,
      icon: <DesktopOutlined className="text-3xl text-gray-400 mb-2" />,
      apiCall: uploadDocumentAPI,
    };
  if (type === "document")
    return {
      ...UPLOAD_CONFIG.DOCUMENT,
      field: "docFile",
      label: "Tài liệu đính kèm",
      maxCount: 1,
      icon: <FileTextOutlined className="text-3xl text-gray-400 mb-2" />,
      apiCall: uploadDocumentAPI,
    };
  if (type === "video")
    return {
      ...UPLOAD_CONFIG.VIDEO,
      field: "videoFile",
      label: "Video bài giảng",
      maxCount: 1,
      icon: <VideoCameraOutlined className="text-3xl text-gray-400 mb-2" />,
      checkRatio: true,
      aspectRatio: ASPECT_RATIOS.VIDEO,
      apiCall: undefined,
    };
  return null;
};

interface Props {
  fieldKey: number;
  chapterIndex: number;
  lessonIndex: number;
  remove: (index: number | number[]) => void;
}

export const LessonItem = memo(
  ({ chapterIndex, lessonIndex, remove }: Props) => {
    const onRemoveLesson = useCallback(() => {
      remove(lessonIndex);
    }, [remove, lessonIndex]);

    return (
      <Card
        size="small"
        className="bg-gray-50 border-gray-200 hover:border-blue-300 transition-colors group"
        styles={{ body: { padding: "12px" } }}
      >
        <div className="flex gap-3 items-start">
          <div className="pt-2 font-mono text-xs text-gray-400 font-bold min-w-[20px]">
            {lessonIndex + 1}.
          </div>
          <div className="flex-1">
            <Row gutter={8}>
              <Col xs={24} md={12}>
                <Form.Item
                  name={[lessonIndex, "title"]}
                  rules={[{ required: true, message: "Nhập tên bài" }]}
                  className="mb-2"
                >
                  <Input
                    placeholder="Tên bài học"
                    prefix={<FileTextOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
              <Col xs={12} md={8}>
                <Form.Item
                  name={[lessonIndex, "type"]}
                  initialValue="video"
                  className="mb-2"
                >
                  <Select options={LESSON_TYPES} />
                </Form.Item>
              </Col>
              <Col xs={12} md={4}>
                <Form.Item
                  name={[lessonIndex, "duration"]}
                  initialValue={0}
                  className="mb-2"
                >
                  <InputNumber min={0} placeholder="Phút" className="w-full" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              noStyle
              shouldUpdate={(
                prev: ICreateCourseForm,
                curr: ICreateCourseForm
              ) => {
                const prevType =
                  prev.chapters?.[chapterIndex]?.lessons?.[lessonIndex]?.type;
                const currType =
                  curr.chapters?.[chapterIndex]?.lessons?.[lessonIndex]?.type;
                return prevType !== currType;
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

                if (config) {
                  return (
                    <Form.Item
                      name={[lessonIndex, config.field]}
                      getValueFromEvent={normFile}
                      className="mb-0 animate-fade-in"
                      rules={[
                        {
                          required: type !== "video",
                          message: "Vui lòng tải nội dung lên!",
                        },
                      ]}
                    >
                      <CommonFileUpload
                        accept={config.ACCEPT}
                        maxSizeMB={config.MAX_SIZE_MB}
                        helperText={`${config.HELPER_TEXT}`}
                        listType="picture"
                        height={160}
                        maxCount={config.maxCount}
                        multiple={config.maxCount > 1}
                        icon={config.icon}
                        label={`Click tải lên ${config.label}`}
                        checkRatio={config.checkRatio}
                        aspectRatio={config.aspectRatio}
                        apiCall={config.apiCall}
                      />
                    </Form.Item>
                  );
                }

                return null;
              }}
            </Form.Item>
          </div>
          <div className="mt-3 pt-3 border-t border-dashed border-gray-300">
            <Typography.Text className="text-xs text-gray-500 font-semibold mb-2 block">
              TÀI LIỆU THAM KHẢO (TÙY CHỌN)
            </Typography.Text>
            <Form.Item
              name={[lessonIndex, "refDocFile"]}
              getValueFromEvent={normFile}
              className="mb-0"
            >
              <CommonFileUpload
                accept={UPLOAD_CONFIG.DOCUMENT.ACCEPT}
                maxSizeMB={UPLOAD_CONFIG.DOCUMENT.MAX_SIZE_MB}
                helperText="PDF, DOC, DOCX (Tài liệu bổ trợ)"
                listType="picture"
                height={80}
                maxCount={1}
                icon={
                  <PaperClipOutlined className="text-2xl text-gray-400 mb-1" />
                }
                label="Đính kèm tài liệu tham khảo"
                apiCall={uploadDocumentAPI}
              />
            </Form.Item>
          </div>
          <Tooltip title="Xóa bài học này">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={onRemoveLesson}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </Tooltip>
        </div>
      </Card>
    );
  }
);
LessonItem.displayName = "LessonItem";
