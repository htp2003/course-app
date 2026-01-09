import { memo, useCallback } from "react";
import { Form, Input, Button, Card, Tooltip, Popconfirm, App } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { LessonItem } from "./lesson-item";

interface Props {
  fieldKey: number;
  fieldIndex: number;
  remove: (index: number | number[]) => void;
  totalChapters: number;
  isPreview?: boolean;
  anchorPrefix?: string;
}

export const ChapterItem = memo(
  ({
    fieldIndex,
    remove,
    totalChapters,
    isPreview = false,
    anchorPrefix = "anchor",
  }: Props) => {
    const { message } = App.useApp();

    const onRemoveChapter = useCallback(() => {
      if (totalChapters <= 1) {
        message.warning("Không thể xóa chương cuối cùng!");
        return;
      }
      remove(fieldIndex);
    }, [remove, fieldIndex, totalChapters, message]);

    return (
      <Card
        className="shadow-sm border-indigo-100 hover:shadow-md transition-shadow duration-300"
        styles={{ body: { padding: 12 } }}
      >
        <div className="flex items-center gap-3 mb-3 p-2 bg-indigo-50/50 rounded-lg border border-indigo-100">
          <Form.Item
            label="Tên chương"
            colon={false}
            labelCol={{ span: 24 }}
            name={[fieldIndex, "title"]}
            extra
            rules={
              isPreview
                ? []
                : [
                    { required: true, message: "Nhập tên chương" },
                    { min: 3, message: "Tên chương phải có ít nhất 3 ký tự" },
                    {
                      validator: (_, value) => {
                        if (value && !value.trim()) {
                          return Promise.reject(
                            new Error("Vui lòng nhập tên chương hợp lệ")
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]
            }
            className="mb-0 flex-1"
          >
            <Input
              size="middle"
              placeholder="Ví dụ: Giới thiệu khóa học..."
              className="text-gray-700"
              disabled={isPreview}
              onBlur={(e) => {
                e.target.value = e.target.value.trim();
              }}
            />
          </Form.Item>

          {!isPreview && (
            <Popconfirm
              title="Xác nhận xóa chương"
              description="Bạn có chắc muốn xóa chương này? Tất cả bài học trong chương sẽ bị xóa."
              onConfirm={onRemoveChapter}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              disabled={totalChapters <= 1}
            >
              <Tooltip
                title={
                  totalChapters <= 1 ? "Không thể xóa chương cuối cùng" : ""
                }
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={totalChapters <= 1}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </div>

        <div className="pl-4 md:pl-10 border-l-2 border-indigo-50 space-y-3">
          <Form.List
            name={[fieldIndex, "lessons"]}
            rules={
              isPreview
                ? []
                : [
                    {
                      validator: async (_, lessons) => {
                        if (!Array.isArray(lessons) || lessons.length === 0) {
                          throw new Error("Chương này cần ít nhất 1 Bài học");
                        }
                      },
                    },
                  ]
            }
          >
            {(subFields, { add, remove: removeLesson }, meta) => (
              <>
                {!isPreview && meta.errors.length > 0 && (
                  <div>
                    <Form.ErrorList errors={meta.errors} />
                  </div>
                )}
                {subFields.map((subField) => (
                  <div
                    key={subField.key}
                    id={`${anchorPrefix}-${fieldIndex}-${subField.name}`}
                    className="scroll-mt-24"
                  >
                    <LessonItem
                      fieldKey={subField.key}
                      chapterIndex={fieldIndex}
                      lessonIndex={subField.name}
                      remove={removeLesson}
                      totalLessons={subFields.length}
                      isPreview={isPreview}
                    />
                  </div>
                ))}

                {!isPreview && (
                  <Button
                    type="dashed"
                    size="middle"
                    onClick={() =>
                      add({ title: "", type: "video", duration: 0 })
                    }
                    block
                    icon={<PlusOutlined />}
                    className="mt-2 text-indigo-500 border-indigo-300 border-dashed hover:text-indigo-700 hover:border-indigo-500 hover:bg-indigo-50"
                  >
                    Thêm bài học mới
                  </Button>
                )}
              </>
            )}
          </Form.List>
        </div>
      </Card>
    );
  }
);
