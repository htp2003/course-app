import { memo } from "react";
import { Form, Button, Empty } from "antd";
import { PlusOutlined, FolderAddOutlined } from "@ant-design/icons";
import { ChapterItem } from "./chapter-item";

interface Props {
  isPreview?: boolean;
  anchorPrefix?: string;
  anchorRootId?: string;
}

export const StepTwoRightPane = memo(
  ({ isPreview = false, anchorPrefix = "anchor", anchorRootId }: Props) => {
    return (
      <div className="flex flex-col gap-6" id={anchorRootId}>
        <Form.List
          name="chapters"
          rules={
            isPreview
              ? []
              : [
                  {
                    validator: async (_, chapters) => {
                      if (!Array.isArray(chapters) || chapters.length === 0) {
                        throw new Error(
                          "Vui lòng tạo ít nhất 1 Chương nội dung!"
                        );
                      }
                    },
                  },
                ]
          }
        >
          {(fields, { add, remove }, meta) => (
            <>
              {!isPreview && meta.errors.length > 0 && (
                <div>
                  <Form.ErrorList errors={meta.errors} />
                </div>
              )}

              {fields.length === 0 && !isPreview && (
                <div className="text-center py-20 bg-gray-50 border-2 border-dashed rounded-xl">
                  <Empty description="Hãy bắt đầu xây dựng nội dung khóa học" />
                  <Button
                    type="primary"
                    size="middle"
                    icon={<PlusOutlined />}
                    onClick={() => add({ title: "", lessons: [] })}
                    className="mt-3"
                  >
                    Tạo chương
                  </Button>
                </div>
              )}

              {fields.length === 0 && isPreview && (
                <div className="text-center py-20 bg-gray-50 border-2 border-dashed rounded-xl">
                  <Empty description="Chưa có nội dung khóa học" />
                </div>
              )}

              <div className="flex flex-col gap-6">
                {fields.map((field) => (
                  <div
                    key={field.key}
                    id={`${anchorPrefix}-${field.name}`}
                    className="scroll-mt-4 transition-all duration-300"
                  >
                    <ChapterItem
                      fieldKey={field.key}
                      fieldIndex={field.name}
                      remove={remove}
                      totalChapters={fields.length}
                      isPreview={isPreview}
                      anchorPrefix={anchorPrefix}
                    />
                  </div>
                ))}
              </div>

              {fields.length > 0 && !isPreview && (
                <Button
                  type="dashed"
                  size="middle"
                  onClick={() => add({ title: "", lessons: [] })}
                  block
                  className="h-11 text-base border border-indigo-200 text-indigo-600 hover:border-indigo-400 hover:text-indigo-700"
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
  }
);
