import { memo, useCallback } from "react";
import { Form, Input, Select, Row, Col, Button, Tooltip, Tag } from "antd";
import {
  DeleteOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  DesktopOutlined,
} from "@ant-design/icons";
import {
  LESSON_TYPES,
  UPLOAD_CONFIG,
  ASPECT_RATIOS,
} from "../../../common/constants/constants";
import { normFile } from "../../../common/utils/utils";
import { CommonFileUpload } from "../common/common-file-upload";
import type {

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
}

export const LessonItem = memo(
  ({ chapterIndex, lessonIndex, remove }: Props) => {
    const onRemoveLesson = useCallback(() => {
      remove(lessonIndex);
    }, [remove, lessonIndex]);

    return (
      <div className="group relative bg-slate-50 rounded-xl border border-slate-200 p-4 mb-4 hover:border-blue-300 hover:shadow-md transition-all duration-300">
        <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center font-bold text-slate-600 z-10">
          {lessonIndex + 1}
        </div>

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip title="Xóa bài học này">
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              onClick={onRemoveLesson}
              className="bg-white/80 backdrop-blur-sm border border-red-100 shadow-sm"
            />
          </Tooltip>
        </div>

        <div className="mb-4 pl-2">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={14}>
              <div className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider ">
                Tên bài học
              </div>
              <Form.Item
                name={[lessonIndex, "title"]}
                rules={[{ required: true, message: "Nhập tên" }]}
                className="mb-0"
              >
                <Input
                  placeholder="Nhập tên bài học..."
                  className="font-medium text-slate-700 hover:bg-white focus:bg-white bg-transparent border-t-0 border-x-0 border-b border-slate-300 rounded-none px-0 shadow-none focus:shadow-none focus:border-blue-500"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={10}>
              <div className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">
                Loại nội dung
              </div>
              <Form.Item
                name={[lessonIndex, "type"]}
                initialValue="video"
                className="mb-0"
              >
                <Select
                  options={LESSON_TYPES}
                  variant="borderless"
                  className="border-b border-slate-300 w-full"
                  popupMatchSelectWidth={false}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className="bg-white rounded-lg border border-slate-100 p-3 shadow-sm">
          <Row gutter={[16, 16]}>
            <Col span={24} className="border-b border-slate-100 pb-4">
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) =>
                  prev.chapters?.[chapterIndex]?.lessons?.[lessonIndex]?.type !==
                  curr.chapters?.[chapterIndex]?.lessons?.[lessonIndex]?.type
                }
              >
                {({ getFieldValue }) => {
                  const type = getFieldValue(["chapters", chapterIndex, "lessons", lessonIndex, "type"]);
                  const config = getUploadConfig(type);
                  if (!config) return null;

                  return (
                    <div className="h-full flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag color="blue" className="m-0 border-0 bg-blue-50 text-blue-600 font-bold">CHÍNH</Tag>
                        <span className="text-xs text-slate-500">Nội dung bài học</span>
                      </div>
                      <div className="flex-1">
                        <Form.Item
                          name={[lessonIndex, config.field]}
                          getValueFromEvent={normFile}
                          className="mb-0 h-full"
                          rules={[{ required: type !== "video", message: "Bắt buộc" }]}
                        >
                          <CommonFileUpload
                            height={120}
                          />
                        </Form.Item>
                      </div>
                    </div>
                  );
                }}
              </Form.Item>
            </Col>

            <Col span={24}>
              <div className="h-full flex flex-col w-full">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="m-0 border-0 bg-slate-100 text-slate-500 font-bold">PHỤ</Tag>
                  <span className="text-xs text-slate-400">Tài liệu đính kèm</span>
                </div>
                <div className="flex-1 w-full">
                  <Form.Item
                    name={[lessonIndex, "refDocFile"]}
                    getValueFromEvent={normFile}
                    className="mb-0 h-full w-full"
                  >
                    <CommonFileUpload
                      height={120}
                    />
                  </Form.Item>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
);
LessonItem.displayName = "LessonItem";
