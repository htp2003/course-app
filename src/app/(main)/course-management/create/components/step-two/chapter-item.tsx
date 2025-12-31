import { memo, useCallback } from "react";
import { Form, Input, Button, Card, Tooltip } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { LessonItem } from "./lesson-item";

interface Props {
  fieldKey: number;
  fieldIndex: number;
  remove: (index: number | number[]) => void;
}

export const ChapterItem = memo(({ fieldIndex, remove }: Props) => {
  const onRemoveChapter = useCallback(() => {
    remove(fieldIndex);
  }, [remove, fieldIndex]);

  return (
    <Card
      className="shadow-sm border-indigo-100 hover:shadow-md transition-shadow duration-300"
      styles={{ body: { padding: "16px" } }}
    >
      <div className="flex items-center gap-3 mb-4 p-2 bg-indigo-50/50 rounded-lg border border-indigo-100">
        <Form.Item
          label="Tên chương"
          colon={false}
          labelCol={{ span: 24 }}
          name={[fieldIndex, "title"]}
          rules={[{ required: true, message: "Nhập tên chương" }]}
          className="mb-0 flex-1"
        >
          <Input
            size="large"
            placeholder="Ví dụ: Giới thiệu khóa học..."
            className="font-medium text-gray-700 bg-white border-indigo-200 focus:border-indigo-500"
            variant="filled"
          />
        </Form.Item>

        <Tooltip title="Xóa chương này">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={onRemoveChapter}
          />
        </Tooltip>
      </div>

      <div className="pl-4 md:pl-10 border-l-2 border-indigo-50 space-y-3">
        <Form.List name={[fieldIndex, "lessons"]}>
          {(subFields, { add, remove: removeLesson }) => (
            <>
              {subFields.map((subField) => (
                <div
                  key={subField.key}
                  id={`anchor-${fieldIndex}-${subField.name}`}
                  className="scroll-mt-24"
                >
                  <LessonItem
                    fieldKey={subField.key}
                    chapterIndex={fieldIndex}
                    lessonIndex={subField.name}
                    remove={removeLesson}
                  />
                </div>
              ))}

              <Button
                type="dashed"
                onClick={() => add({ title: "", type: "video", duration: 0 })}
                block
                icon={<PlusOutlined />}
                className="mt-2 text-indigo-500 border-indigo-300 border-dashed hover:text-indigo-700 hover:border-indigo-500 hover:bg-indigo-50 h-10"
              >
                Thêm bài học mới
              </Button>
            </>
          )}
        </Form.List>
      </div>
    </Card>
  );
});
