import { useState, useEffect } from "react";
import { Form, App, notification } from "antd";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";

import { createCourseAPI, updateCourseAPI } from "../services/api";
import { getErrorMessage } from "../../common/utils/utils";
import type {
  ICreateCourseForm,
  ILesson,
  IChapter,
  IQuiz,
} from "../../common/types/types";
import type { TCourseDetailResponse } from "../../common/types/api-response";

import { mapUiToApiPayload } from "../utils/payload-mapper";
import { mapApiToUiForm } from "../../common/utils/mapper";
import { useGetEditData } from "./use-get-edit-data";

interface ICourseApiPayload {
  id?: string;
  title: string;
  description: string;
  mediaFileId: number;
  bannerUri: string;
  type: number;
  timeStateType: number;
  isHasBadge: number;
  courseBadgeFileId: number;
  publishAt: string;
  startTime: string | null;
  endTime: string | null;
  chapters: Array<{
    title: string;
    no: number;
    lessons: Array<{
      title: string;
      no: number;
      type: number;
      description: string;
      mediaFileId: number;
      rawUrl: string;
      documentMediaFileId: number;
      docRawUrl: string;
      thumbnailUri: string;
    }>;
  }>;
  exams: Array<{
    title: string;
    description?: string;
    mediaFileId?: number;
    lessonNo: number;
    chapterNo: number;
    type: number;
    examPassRate?: number;
    quizzes: Array<{
      content: string;
      type: number;
      mediaFileId?: number;
      explanation?: string;
      quizAns: Array<{
        content: string;
        isTrue: boolean;
      }>;
    }>;
    quizIds?: number[];
  }>;
  courseTopics: number[];
  isLearnInOrder: boolean;
}

const DRAFT_KEY = "course_create_draft_v1";

type TApiDetailData = TCourseDetailResponse["data"];

export const useCourseForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [form] = Form.useForm<ICreateCourseForm>();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { message } = App.useApp();

  const courseId = searchParams.get("id");
  const isEditMode = !!courseId;

  const { data: apiData, isFetching: isLoadingDetail } =
    useGetEditData(courseId);

  useEffect(() => {
    if (apiData && isEditMode) {
      const rawData = apiData as unknown as TApiDetailData;

      const uiData = mapApiToUiForm(rawData);
      form.setFieldsValue(uiData);
    }
  }, [apiData, isEditMode, form]);

  useEffect(() => {
    if (currentStep > maxStep) setMaxStep(currentStep);
  }, [currentStep, maxStep]);

  useEffect(() => {
    if (isEditMode) return;
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const { step, data } = JSON.parse(draft);

        if (data.timeRange && Array.isArray(data.timeRange)) {
          data.timeRange = [dayjs(data.timeRange[0]), dayjs(data.timeRange[1])];
        }

        if (data.publishAt) {
          data.publishAt = dayjs(data.publishAt);
        }

        if (data.thumbnail) delete data.thumbnail;

        form.setFieldsValue(data);
        setCurrentStep(step);
      } catch (e) {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, [form, isEditMode]);

  const saveSnapshot = (targetStep: number) => {
    if (isEditMode) return;
    const allData = form.getFieldsValue(true);
    const { thumbnail, ...safeData } = allData;
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ step: targetStep, data: safeData })
    );
  };

  const getFieldsToValidate = (): (string | (string | number)[])[] => {
    if (currentStep === 0) {
      const timeStateType = form.getFieldValue("timeStateType");
      const isHasBadge = form.getFieldValue("isHasBadge");

      const baseFields = [
        "title",
        "category",
        "description",
        "thumbnail",
        "type",
        "publishAt",
        "isHasBadge",
        "isLearnInOrder",
      ];

      if (timeStateType === 1) {
        baseFields.push("timeRange");
      }

      if (isHasBadge === 1) {
        baseFields.push("courseBadgeFile");
      }

      return baseFields;
    }

    const chapters = form.getFieldValue("chapters") || [];
    const paths: (string | (string | number)[])[] = [];

    if (currentStep === 1) {
      paths.push("chapters");
      chapters.forEach((chap: IChapter, cIdx: number) => {
        paths.push(["chapters", cIdx, "title"]);
        if (chap.lessons) {
          chap.lessons.forEach((less: ILesson, lIdx: number) => {
            const lessonPath = ["chapters", cIdx, "lessons", lIdx];

            paths.push([...lessonPath, "title"]);
            paths.push([...lessonPath, "duration"]);
            paths.push([...lessonPath, "type"]);

            if (less.type === "document") {
              paths.push([...lessonPath, "docFile"]);
            } else if (less.type === "slide") {
              paths.push([...lessonPath, "slideFile"]);
            }
          });
        }
      });
    }

    if (currentStep === 2) {
      chapters.forEach((chap: IChapter, cIdx: number) => {
        if (chap.lessons) {
          chap.lessons.forEach((less: ILesson, lIdx: number) => {
            if (less.quizzes) {
              less.quizzes.forEach((quiz: IQuiz, qIdx: number) => {
                const quizPath = [
                  "chapters",
                  cIdx,
                  "lessons",
                  lIdx,
                  "quizzes",
                  qIdx,
                ];
                paths.push([...quizPath, "title"]);

                if (quiz.questions) {
                  quiz.questions.forEach((_question, questionIdx: number) => {
                    const questionPath = [
                      ...quizPath,
                      "questions",
                      questionIdx,
                    ];
                    paths.push([...questionPath, "title"]);
                    paths.push([...questionPath, "score"]);
                  });
                }
              });
            }
          });
        }
      });
    }

    return paths;
  };

  const validateCurrentStep = async () => {
    try {
      const fields = getFieldsToValidate();

      if (currentStep === 1) {
        const chapters = form.getFieldValue("chapters");
        if (!chapters || chapters.length === 0) {
          message.error("Vui lòng tạo ít nhất 1 Chương nội dung!");
          return false;
        }
        const hasLesson = chapters.some(
          (ch: IChapter) => ch.lessons && ch.lessons.length > 0
        );
        if (!hasLesson) {
          message.error("Vui lòng tạo ít nhất 1 Bài học!");
          return false;
        }
      }

      if (fields.length > 0) {
        await form.validateFields(fields);
      }

      return true;
    } catch (error: unknown) {
      if (error && typeof error === "object" && "errorFields" in error) {
        const validationError = error as {
          errorFields?: Array<{ name: string[] }>;
        };
        if (validationError.errorFields?.length) {
          form.scrollToField(validationError.errorFields[0].name, {
            behavior: "smooth",
            block: "center",
          });
          message.error("Vui lòng điền đầy đủ thông tin còn thiếu!");
        }
      }
      return false;
    }
  };

  const handleStepChange = async (targetStep: number) => {
    if (targetStep > currentStep) {
      const isValid = await validateCurrentStep();
      if (!isValid) return;
    }
    saveSnapshot(targetStep);
    setCurrentStep(targetStep);
  };

  const next = () => handleStepChange(currentStep + 1);
  const prev = () => handleStepChange(currentStep - 1);
  const goTo = (targetStep: number) => handleStepChange(targetStep);

  const mutation = useMutation({
    mutationFn: (values: ICourseApiPayload) => {
      if (isEditMode && courseId)
        return updateCourseAPI({ ...values, id: courseId });
      return createCourseAPI(values);
    },
    onSuccess: () => {
      notification.success({
        message: "Thành công",
        description: isEditMode
          ? "Đã cập nhật khóa học!"
          : "Đã tạo khóa học mới!",
      });
      if (!isEditMode) localStorage.removeItem(DRAFT_KEY);
      form.resetFields();
      navigate("/course-management/list");
    },
    onError: (err: unknown) => {
      notification.error({ message: "Lỗi", description: getErrorMessage(err) });
    },
  });

  const onSubmit = async () => {
    try {
      await form.validateFields();
      const rawValues = form.getFieldsValue(true);
      const apiPayload = mapUiToApiPayload(rawValues);

      mutation.mutate(apiPayload);
    } catch (e: unknown) {
      message.error("Vui lòng kiểm tra lại form");
      if (e && typeof e === "object" && "errorFields" in e) {
        const validationError = e as {
          errorFields?: Array<{ name: string[] }>;
        };
        if (validationError.errorFields?.length) {
          form.scrollToField(validationError.errorFields[0].name, {
            behavior: "smooth",
            block: "center",
          });
        }
      }
    }
  };

  return {
    currentStep,
    maxStep,
    form,
    next,
    prev,
    goTo,
    onSubmit,
    isSubmitting: mutation.isPending || isLoadingDetail,
    isEditMode,
  };
};
