import { memo } from "react";
import { Form, Button, Empty } from "antd";
import { PlusOutlined, FolderAddOutlined } from "@ant-design/icons";
import { ChapterItem } from "./chapter-item";

export const StepTwoRightPane = memo(() => {
  return (
    <div className="flex flex-col gap-6">
      <Form.List name="chapters">
        {(fields, { add, remove }) => (
          <>
            {fields.length === 0 && (
              <div className="text-center py-20 bg-gray-50 border-2 border-dashed rounded-xl">
                <Empty description="Hãy bắt đầu xây dựng nội dung khóa học" />
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => add({ title: "", lessons: [] })}
                  className="mt-4"
                >
                  Tạo chương đầu tiên
                </Button>
              </div>
            )}

            <div className="flex flex-col gap-6">
              {fields.map((field) => (
                <div
                  key={field.key}
                  id={`anchor-${field.name}`}
                  className="scroll-mt-4 transition-all duration-300"
                >
                  <ChapterItem
                    fieldKey={field.key}
                    fieldIndex={field.name}
                    remove={remove}
                  />
                </div>
              ))}
            </div>

            {fields.length > 0 && (
              <Button
                type="dashed"
                size="large"
                onClick={() => add({ title: "", lessons: [] })}
                block
                className="h-14 text-lg border-2 border-indigo-200 text-indigo-600 hover:border-indigo-400 hover:text-indigo-700"
                icon={<FolderAddOutlined />}
              >
                Thêm chương mới
              </Button>
            )}
          </>
        )}
      </Form.List>
    </div>
  );
});
