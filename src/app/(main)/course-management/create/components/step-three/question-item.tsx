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
  const form = Form.useFormInstance<ICreateCourseForm>();

  const fullPath = useMemo(
    (): NamePath => [
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
    (): NamePath => [...(fullPath as (string | number)[]), "options"],
    [fullPath]
  );

  const validateOptions = useCallback(
    async (_: unknown, options: IAnswerOption[] | undefined) => {
      const type = form.getFieldValue([
        ...(fullPath as (string | number)[]),
        "type",
      ] as NamePath) as QuestionType | undefined;

      if (type === "essay") return;

      const isMulti = Boolean(
        form.getFieldValue([
          ...(fullPath as (string | number)[]),
          "isMultipleChoice",
        ] as NamePath)
      );

      const normalizedOptions = Array.isArray(options) ? options : [];

      if (normalizedOptions.length < 2) {
        throw new Error("Cần ít nhất 2 đáp án");
      }

      if (isMulti && normalizedOptions.length < 3) {
        throw new Error("Chế độ nhiều đáp án đúng cần ít nhất 3 lựa chọn");
      }

      const hasEmptyContent = normalizedOptions.some(
        (opt) => !(opt?.content || "").trim()
      );
      if (hasEmptyContent) {
        throw new Error("Vui lòng điền nội dung tất cả đáp án");
      }

      const correctCount = normalizedOptions.filter((o) => o?.isCorrect).length;

      if (!isMulti) {
        if (correctCount !== 1) {
          throw new Error("Vui lòng chọn đúng 1 đáp án đúng");
        }
      } else {
        if (correctCount < 1) {
          throw new Error("Vui lòng chọn ít nhất 1 đáp án đúng");
        }
        if (correctCount === normalizedOptions.length) {
          throw new Error("Phải có ít nhất 1 đáp án sai");
        }
      }
    },
    [form, fullPath]
  );

  
  const syncIsCorrect = useCallback(
    (mode: "single" | "multi", memoryValue: number | boolean[]) => {
      const currentOptions =
        (form.getFieldValue(optionsPath) as IAnswerOption[]) || [];

      const newOptions = currentOptions.map((opt, idx) => ({
        ...opt,
        isCorrect:
          mode === "single"
            ? idx === memoryValue
            : !!(Array.isArray(memoryValue) && memoryValue[idx]),
      }));

      form.setFieldValue(optionsPath, newOptions);
    },
    [form, optionsPath]
  );

  const handleModeChange = useCallback(
    (e: RadioChangeEvent) => {
      const isNextMulti = Boolean(e.target?.value);

      if (isNextMulti) {
        const savedMulti = form.getFieldValue([
          ...(fullPath as (string | number)[]),
          "multiChoiceState",
        ] as NamePath) as boolean[];
        syncIsCorrect("multi", savedMulti);
      } else {
        const savedSingle = form.getFieldValue([
          ...(fullPath as (string | number)[]),
          "singleChoiceState",
        ] as NamePath) as number;
        const targetIndex = typeof savedSingle === "number" ? savedSingle : 0;
        syncIsCorrect("single", targetIndex);
      }
    },
    [form, fullPath, syncIsCorrect]
  );

  const onSingleSelect = (optionIndex: number) => {
    form.setFieldValue(
      [...(fullPath as (string | number)[]), "singleChoiceState"] as NamePath,
      optionIndex
    );
    syncIsCorrect("single", optionIndex);
  };

  const onMultiSelect = (optionIndex: number, checked: boolean) => {
    const multiStatePath = [
      ...(fullPath as (string | number)[]),
      "multiChoiceState",
    ] as NamePath;
    const multiState = (form.getFieldValue(multiStatePath) as boolean[]) || [];
    const newMultiState = [...multiState];
    newMultiState[optionIndex] = checked;

    form.setFieldValue(multiStatePath, newMultiState);
    syncIsCorrect("multi", newMultiState);
  };

  const onRemoveQuestion = useCallback(() => {
    remove(qIndex);
  }, [remove, qIndex]);

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
            {...(!isPreview && { initialValue: QUESTION_TYPE_MAP.CHOICE })}
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
        !isPreview && (
          <Popconfirm
            title="Xóa câu hỏi"
            disabled={totalQuestions <= 1}
            onConfirm={onRemoveQuestion}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={totalQuestions <= 1}
            />
          </Popconfirm>
        )
      }
    >
      <Form.Item
        label="Nội dung câu hỏi"
        name={[qIndex, "title"]}
        rules={isPreview ? [] : [{ required: true, message: "Nhập câu hỏi" }]}
        className="mb-4"
      >
        <Input.TextArea
          placeholder="Nhập nội dung câu hỏi..."
          rows={2}
          disabled={isPreview}
        />
      </Form.Item>

      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) => {
          const type = getFieldValue([
            ...(fullPath as (string | number)[]),
            "type",
          ] as NamePath) as QuestionType | undefined;
          if (type === "essay") return null;

          return (
            <div className="space-y-4">
              <Form.Item
                label="Chế độ đáp án"
                name={[qIndex, "isMultipleChoice"]}
                {...(!isPreview && { initialValue: false })}
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

                        <Form.Item noStyle shouldUpdate>
                          {({ getFieldValue: getVal }) => {
                            const isMulti = getVal([
                              ...(fullPath as (string | number)[]),
                              "isMultipleChoice",
                            ] as NamePath);
                            const isCorrect = getVal([
                              ...(fullPath as (string | number)[]),
                              "options",
                              oIdx,
                              "isCorrect",
                            ] as NamePath);

                            return isMulti ? (
                              <Checkbox
                                disabled={isPreview}
                                checked={!!isCorrect}
                                onChange={(e) =>
                                  onMultiSelect(oIdx, e.target.checked)
                                }
                              />
                            ) : (
                              <Radio
                                disabled={isPreview}
                                checked={!!isCorrect}
                                onChange={() => onSingleSelect(oIdx)}
                              />
                            );
                          }}
                        </Form.Item>

                        <Form.Item
                          name={[opt.name, "content"]}
                          className="flex-1 mb-0"
                          rules={
                            isPreview
                              ? []
                              : [{ required: true, message: "Nhập đáp án" }]
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
                            onConfirm={() => removeOpt(opt.name)}
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

              {!isPreview && (
                <>
                  <Form.Item
                    name={[qIndex, "options"]}
                    rules={[{ validator: validateOptions }]}
                    validateTrigger={["onBlur"]}
                    noStyle
                  >
                    <span />
                  </Form.Item>

                  <Form.Item noStyle shouldUpdate>
                    {() => {
                      const errors = form.getFieldError(optionsPath);
                      if (!errors.length) return null;
                      return (
                        <div>
                          <Form.ErrorList errors={errors} />
                        </div>
                      );
                    }}
                  </Form.Item>
                </>
              )}

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