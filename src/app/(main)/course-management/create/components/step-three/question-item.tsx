import { memo, useCallback, useMemo } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Checkbox,
  Space,
  Typography,
  Radio,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { NamePath } from "antd/es/form/interface";
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
}
export const QuestionItem = memo(
  ({
    fieldKey,
    qIndex,
    remove,
    chapterIndex,
    lessonIndex,
    quizIndex,
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
    const onRemoveQuestion = useCallback(() => {
      remove(qIndex);
    }, [remove, qIndex]);
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
        className="mb-4 bg-gray-50 border-gray-200"
        id={`anchor-question-${fieldKey}`}
        title={
          <Space>
            <span className="font-bold text-blue-600">
              Câu hỏi {qIndex + 1}
            </span>
            <Form.Item
              name={[qIndex, "type"]}
              noStyle
              initialValue={QUESTION_TYPE_MAP.CHOICE}
            >
              <Select size="small" className="w-32" options={QUESTION_TYPES} />
            </Form.Item>
          </Space>
        }
        extra={
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={onRemoveQuestion}
          />
        }
      >
        <Form.Item
          name={[qIndex, "title"]}
          rules={[{ required: true, message: "Nhập câu hỏi" }]}
          className="mb-3"
        >
          <Input.TextArea placeholder="Nhập nội dung câu hỏi..." rows={2} />
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
              return (
                <div className="bg-white p-4 rounded border border-gray-200">
                  <Typography.Text strong className="mb-2 block">
                    Keywords (Từ khóa chấm điểm):
                  </Typography.Text>
                  <Form.Item name={[qIndex, "keywords"]} noStyle>
                    <Select
                      mode="tags"
                      style={{ width: "100%" }}
                      placeholder="Nhập từ khóa..."
                    />
                  </Form.Item>
                </div>
              );
            }
            return (
              <div className="bg-white p-4 rounded border border-gray-200">
                <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-100">
                  <span className="font-semibold text-gray-700 mr-4">
                    Chế độ đáp án:
                  </span>
                  <Form.Item
                    name={[qIndex, "isMultipleChoice"]}
                    noStyle
                    initialValue={false}
                  >
                    <Radio.Group>
                      <Radio value={false}>Một đáp án đúng</Radio>
                      <Radio value={true}>Nhiều đáp án đúng</Radio>
                    </Radio.Group>
                  </Form.Item>
                </div>
                { }
                <Form.List name={[qIndex, "options"]}>
                  {(optFields, { add: addOpt, remove: removeOpt }) => (
                    <div className="flex flex-col gap-2">
                      {optFields.map((opt, oIdx) => (
                        <div key={opt.key} className="flex items-center gap-2">
                          <span className="font-bold w-6 text-center">
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
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
                                    <Checkbox />
                                  ) : (
                                    <Radio
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
                            noStyle
                            rules={[{ required: true }]}
                          >
                            <Input placeholder={`Đáp án ${oIdx + 1}`} />
                          </Form.Item>
                          <DeleteOutlined
                            onClick={() => removeOpt(opt.name)}
                            className="text-gray-400 hover:text-red-500 cursor-pointer"
                          />
                        </div>
                      ))}
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
                    </div>
                  )}
                </Form.List>
                <Form.Item
                  label="Giải thích chi tiết"
                  name={[qIndex, "explanation"]}
                  className="mt-4 mb-0"
                >
                  <Input.TextArea
                    placeholder="Tại sao đáp án này đúng?..."
                    rows={2}
                  />
                </Form.Item>
              </div>
            );
          }}
        </Form.Item>
      </Card>
    );
  }
);
