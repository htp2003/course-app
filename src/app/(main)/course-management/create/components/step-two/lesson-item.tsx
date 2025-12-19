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
} from "antd";
import {
  DeleteOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  DesktopOutlined,
} from "@ant-design/icons";
import { LESSON_TYPES } from "../../../common/constants";
import type { ICreateCourseForm, LessonTypeType } from "../../../common/types";

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
        style={{ padding: "12px" }}
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

                if (type === "document" || type === "slide") {
                  return (
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center bg-white hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer group-upload animate-fade-in">
                      <DesktopOutlined className="text-2xl text-gray-400 mb-2 group-upload-hover:text-blue-500" />
                      <p className="text-sm text-gray-500">
                        Click để tải lên file{" "}
                        {type === "slide"
                          ? "PowerPoint/PDF"
                          : "Tài liệu (PDF/Doc)"}
                      </p>
                    </div>
                  );
                }

                return (
                  <Form.Item
                    name={[lessonIndex, "videoUrl"]}
                    className="mb-0 animate-fade-in"
                    rules={[
                      { required: true, message: "Vui lòng nhập link video" },
                    ]}
                    help={
                      <span className="text-xs text-gray-400">
                        Hỗ trợ: Youtube, Vimeo, hoặc link .mp4 trực tiếp
                      </span>
                    }
                  >
                    <Input
                      prefix={<VideoCameraOutlined />}
                      placeholder="Link Video bài giảng..."
                      allowClear
                    />
                  </Form.Item>
                );
              }}
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
