import { memo, useCallback, useMemo } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Checkbox,
  Typography,
  Radio,
  Select,
  Popconfirm,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { NamePath } from "antd/es/form/interface";
import type { RadioChangeEvent } from "antd";
import {
  QUESTION_TYPES,
  QUESTION_TYPE_MAP,
} from "../../../common/constants/constants";
import type {
  IAnswerOption,
  ICreateCourseForm,
  QuestionType,
} from "../../../common/types/types";
interface Props {
  fieldKey: number;
  qIndex: number;
  remove: (index: number | number[]) => void;
  chapterIndex: number;
  lessonIndex: number;
  quizIndex: number;
  totalQuestions: number;
  isPreview?: boolean;
}
const QuestionItemComponent = ({
  fieldKey,
  qIndex,
  remove,
  chapterIndex,
  lessonIndex,
  quizIndex,
  totalQuestions,
  isPreview = false,
}: Props) => {
  const form = Form.useFormInstance();
  const fullPath = useMemo(
    () => [
      "chapters",
      chapterIndex,
      "lessons",
      lessonIndex,
      "quizzes",
      quizIndex,
      "questions",
      qIndex,
    ],
    [chapterIndex, lessonIndex, quizIndex, qIndex]
  );
  const optionsPath = useMemo(
    () => [...fullPath, "options"] as NamePath,
    [fullPath]
  );

  const onRemoveQuestion = useCallback(() => {
    remove(qIndex);
  }, [remove, qIndex]);

  const enforceSingleCorrect = useCallback(() => {
    const options = (form.getFieldValue(optionsPath) as IAnswerOption[]) || [];
    if (!options.length) return;
    const firstCorrect = options.findIndex((opt) => opt?.isCorrect);
    const keepIndex = firstCorrect >= 0 ? firstCorrect : 0;
    const normalized = options.map((opt, idx) => ({
      ...opt,
      isCorrect: idx === keepIndex,
    }));
    form.setFieldValue(optionsPath, normalized);
  }, [form, optionsPath]);

  const handleModeChange = useCallback(
    (e: RadioChangeEvent) => {
      const nextIsMulti = Boolean(e.target?.value);
      if (!nextIsMulti) {
        enforceSingleCorrect();
      }
    },
    [enforceSingleCorrect]
  );
  const onCheckCorrectAnswer = (optionIndex: number, checked: boolean) => {
    const isMultiple = form.getFieldValue([
      ...fullPath,
      "isMultipleChoice",
    ] as NamePath) as boolean;
    if (isMultiple || !checked) return;
    const optionsPath = [...fullPath, "options"] as NamePath;
    const currentOptions =
      (form.getFieldValue(optionsPath) as IAnswerOption[]) || [];
    const newOptions = currentOptions.map((opt, idx) => ({
      ...opt,
      isCorrect: idx === optionIndex,
    }));
    form.setFieldValue(optionsPath, newOptions);
  };
  return (
    <Card
      size="small"
      className="mb-4"
      id={`anchor-question-${fieldKey}`}
      title={
        <div className="flex flex-wrap items-center gap-3">
          <Typography.Text strong>Câu hỏi {qIndex + 1}</Typography.Text>
          <Form.Item
            name={[qIndex, "type"]}
            noStyle
            initialValue={QUESTION_TYPE_MAP.CHOICE}
          >
            <Select
              size="small"
              className="w-36"
              options={QUESTION_TYPES}
              disabled={isPreview}
            />
          </Form.Item>
        </div>
      }
      extra={
        !isPreview &&
        (totalQuestions <= 1 ? (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            disabled
            title="Mỗi bài quiz cần ít nhất 1 câu hỏi"
          />
        ) : (
          <Popconfirm
            title="Xóa câu hỏi"
            description="Bạn có chắc muốn xóa câu hỏi này?"
            onConfirm={onRemoveQuestion}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        ))
      }
    >
      <Form.Item
        label="Nội dung câu hỏi"
        name={[qIndex, "title"]}
        rules={
          isPreview
            ? []
            : [
                { required: true, message: "Nhập câu hỏi" },
                {
                  validator: (_, value) => {
                    if (value && !value.trim()) {
                      return Promise.reject(
                        new Error("Vui lòng nhập nội dung câu hỏi hợp lệ")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]
        }
        className="mb-4"
      >
        <Input.TextArea
          placeholder="Nhập nội dung câu hỏi..."
          rows={2}
          disabled={isPreview}
        />
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev: ICreateCourseForm, curr: ICreateCourseForm) => {
          const prevType =
            prev.chapters?.[chapterIndex]?.lessons?.[lessonIndex]?.quizzes?.[
              quizIndex
            ]?.questions?.[qIndex]?.type;
          const currType =
            curr.chapters?.[chapterIndex]?.lessons?.[lessonIndex]?.quizzes?.[
              quizIndex
            ]?.questions?.[qIndex]?.type;
          return prevType !== currType;
        }}
      >
        {({ getFieldValue }) => {
          const type = getFieldValue([...fullPath, "type"] as NamePath) as
            | QuestionType
            | undefined;
          if (type === "essay") {
            return null;
          }

          return (
            <div className="space-y-4">
              <Form.Item
                label="Chế độ đáp án"
                name={[qIndex, "isMultipleChoice"]}
                initialValue={false}
                className="mb-0"
              >
                <Radio.Group onChange={handleModeChange} disabled={isPreview}>
                  <Radio value={false}>Một đáp án đúng</Radio>
                  <Radio value={true}>Nhiều đáp án đúng</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.List name={[qIndex, "options"]}>
                {(optFields, { add: addOpt, remove: removeOpt }) => (
                  <div className="flex flex-col gap-2">
                    {optFields.map((opt, oIdx) => (
                      <div
                        key={opt.key}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <Typography.Text strong className="w-6 text-center">
                          {String.fromCharCode(65 + oIdx)}.
                        </Typography.Text>
                        <Form.Item
                          noStyle
                          shouldUpdate={(prev, curr) => {
                            const pVal =
                              prev.chapters?.[chapterIndex]?.lessons?.[
                                lessonIndex
                              ]?.quizzes?.[quizIndex]?.questions?.[qIndex]
                                ?.isMultipleChoice;
                            const cVal =
                              curr.chapters?.[chapterIndex]?.lessons?.[
                                lessonIndex
                              ]?.quizzes?.[quizIndex]?.questions?.[qIndex]
                                ?.isMultipleChoice;
                            return pVal !== cVal;
                          }}
                        >
                          {({ getFieldValue }) => {
                            const isMulti = getFieldValue([
                              ...fullPath,
                              "isMultipleChoice",
                            ] as NamePath);
                            return (
                              <Form.Item
                                name={[opt.name, "isCorrect"]}
                                valuePropName="checked"
                                noStyle
                                initialValue={false}
                                trigger="onChange"
                              >
                                {isMulti ? (
                                  <Checkbox disabled={isPreview} />
                                ) : (
                                  <Radio
                                    disabled={isPreview}
                                    onChange={(e) =>
                                      onCheckCorrectAnswer(
                                        oIdx,
                                        e.target.checked
                                      )
                                    }
                                  />
                                )}
                              </Form.Item>
                            );
                          }}
                        </Form.Item>

                        <Form.Item
                          name={[opt.name, "content"]}
                          className="flex-1 mb-0"
                          rules={
                            isPreview
                              ? []
                              : [
                                  { required: true, message: "Nhập đáp án" },
                                  {
                                    validator: (_, value) => {
                                      if (value && !value.trim()) {
                                        return Promise.reject(
                                          new Error(
                                            "Vui lòng nhập đáp án hợp lệ"
                                          )
                                        );
                                      }
                                      return Promise.resolve();
                                    },
                                  },
                                ]
                          }
                        >
                          <Input
                            placeholder={`Đáp án ${oIdx + 1}`}
                            disabled={isPreview}
                            onBlur={(e) => {
                              e.target.value = e.target.value.trim();
                            }}
                          />
                        </Form.Item>

                        {!isPreview && (
                          <Popconfirm
                            title="Xóa đáp án"
                            description="Bạn có chắc muốn xóa đáp án này?"
                            onConfirm={() => removeOpt(opt.name)}
                            okText="Xóa"
                            cancelText="Hủy"
                          >
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                            />
                          </Popconfirm>
                        )}
                      </div>
                    ))}
                    {!isPreview && (
                      <Button
                        type="dashed"
                        onClick={() =>
                          addOpt({ content: "", isCorrect: false })
                        }
                        block
                        icon={<PlusOutlined />}
                      >
                        Thêm đáp án
                      </Button>
                    )}
                  </div>
                )}
              </Form.List>
              <Form.Item
                label="Giải thích đáp án"
                name={[qIndex, "explanation"]}
                className="mb-0"
              >
                <Input.TextArea
                  placeholder="Tại sao đáp án này đúng?..."
                  rows={2}
                  disabled={isPreview}
                />
              </Form.Item>
            </div>
          );
        }}
      </Form.Item>
    </Card>
  );
};

const areEqual = (prev: Props, next: Props) => {
  return (
    prev.fieldKey === next.fieldKey &&
    prev.qIndex === next.qIndex &&
    prev.chapterIndex === next.chapterIndex &&
    prev.lessonIndex === next.lessonIndex &&
    prev.quizIndex === next.quizIndex &&
    prev.totalQuestions === next.totalQuestions &&
    prev.isPreview === next.isPreview
  );
};

export const QuestionItem = memo(QuestionItemComponent, areEqual);
