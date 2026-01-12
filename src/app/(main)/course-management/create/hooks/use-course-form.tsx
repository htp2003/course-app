import { useState, useEffect } from "react";
import { Form, App } from "antd";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import type { UploadFile } from "antd/es/upload/interface";

import { createCourseAPI } from "../services/api";
import { getErrorMessage } from "../../common/utils/utils";
import {
  COURSE_END_PRIZE,
  COURSE_TIME_STATE_TYPE,
} from "../../common/constants/constants";
import type {
  ICreateCourseForm,
  ILesson,
  IChapter,
  IQuiz,
  IQuestion,
  IAnswerOption,
} from "../../common/types/types";

import { mapUiToApiPayload } from "../utils/payload-mapper";
import {
  normalizeEssayQuestions,
  serializeFile,
  deserializeFile,
} from "../utils/form-normalizers";

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
const AUTOSAVE_INTERVAL_MS = 5000;
const PASS_RATE_MIN = 0;
const PASS_RATE_MAX = 100;

const notNull = <T,>(value: T | null): value is T => value !== null;

export const useCourseForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [hasValidationError, setHasValidationError] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm<ICreateCourseForm>();

  const navigate = useNavigate();
  const { message } = App.useApp();

  useEffect(() => {
    if (currentStep > maxStep) setMaxStep(currentStep);
  }, [currentStep, maxStep]);

  const handleFieldsChange = () => {
    if (!isFormDirty) {
      setIsFormDirty(true);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFormDirty && !isSubmitting) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isFormDirty, isSubmitting]);

  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        type DraftPayload = {
          step?: number;
          maxStep?: number;
          data?: Partial<ICreateCourseForm> & Record<string, unknown>;
        };

        const parsed = JSON.parse(draft) as DraftPayload;
        const step = parsed.step ?? 0;
        const storedMaxStep = parsed.maxStep ?? 0;
        const data = parsed.data ?? {};

        const toDayjsOrUndefined = (value: unknown) =>
          typeof value === "string" ? dayjs(value) : undefined;

        const toDayjsRangeOrUndefined = (value: unknown) => {
          if (!Array.isArray(value) || value.length < 2) return undefined;
          const start =
            typeof value[0] === "string" ? dayjs(value[0]) : undefined;
          const end =
            typeof value[1] === "string" ? dayjs(value[1]) : undefined;
          return start && end
            ? ([start, end] as [dayjs.Dayjs, dayjs.Dayjs])
            : undefined;
        };

        const transformedData: Partial<ICreateCourseForm> &
          Record<string, unknown> = {
          ...data,
          timeRange: toDayjsRangeOrUndefined(data.timeRange),
          publishAt: toDayjsOrUndefined(data.publishAt),
          thumbnail:
            data.thumbnail && Array.isArray(data.thumbnail)
              ? data.thumbnail
                  .map((f: unknown) => deserializeFile(f as UploadFile))
                  .filter(notNull)
              : data.thumbnail,
          courseBadgeFile:
            data.courseBadgeFile && Array.isArray(data.courseBadgeFile)
              ? data.courseBadgeFile
                  .map((f: unknown) => deserializeFile(f as UploadFile))
                  .filter(notNull)
              : data.courseBadgeFile,
          chapters:
            data.chapters && Array.isArray(data.chapters)
              ? data.chapters.map((chapter: IChapter) => ({
                  ...chapter,
                  lessons:
                    chapter.lessons && Array.isArray(chapter.lessons)
                      ? chapter.lessons.map((lesson: ILesson) => ({
                          ...lesson,
                          docFile:
                            lesson.docFile && Array.isArray(lesson.docFile)
                              ? lesson.docFile
                                  .map((f: unknown) =>
                                    deserializeFile(f as UploadFile)
                                  )
                                  .filter(notNull)
                              : lesson.docFile,
                          slideFile:
                            lesson.slideFile && Array.isArray(lesson.slideFile)
                              ? lesson.slideFile
                                  .map((f: unknown) =>
                                    deserializeFile(f as UploadFile)
                                  )
                                  .filter(notNull)
                              : lesson.slideFile,
                          videoFile:
                            lesson.videoFile && Array.isArray(lesson.videoFile)
                              ? lesson.videoFile
                                  .map((f: unknown) =>
                                    deserializeFile(f as UploadFile)
                                  )
                                  .filter(notNull)
                              : lesson.videoFile,
                          refDocFile:
                            lesson.refDocFile &&
                            Array.isArray(lesson.refDocFile)
                              ? lesson.refDocFile
                                  .map((f: unknown) =>
                                    deserializeFile(f as UploadFile)
                                  )
                                  .filter(notNull)
                              : lesson.refDocFile,
                        }))
                      : chapter.lessons,
                }))
              : data.chapters,
        };

        form.setFieldsValue(transformedData);
        setCurrentStep(step);
        setMaxStep(Math.max(storedMaxStep, step));
      } catch (e) {
        console.error("Lỗi khi tải bản nháp khóa học:", e);
      }
    }
  }, [form]);

  const saveSnapshot = (targetStep: number) => {
    const allData = form.getFieldsValue(true);

    const normalizedData = normalizeEssayQuestions(
      allData as ICreateCourseForm
    );

    const safeData: ICreateCourseForm = {
      ...normalizedData,
    } as ICreateCourseForm;

    if (safeData.thumbnail && Array.isArray(safeData.thumbnail)) {
      safeData.thumbnail = safeData.thumbnail
        .map(serializeFile)
        .filter(notNull);
    }

    if (safeData.courseBadgeFile && Array.isArray(safeData.courseBadgeFile)) {
      safeData.courseBadgeFile = safeData.courseBadgeFile
        .map(serializeFile)
        .filter(notNull);
    }

    if (safeData.chapters && Array.isArray(safeData.chapters)) {
      safeData.chapters = safeData.chapters.map((chapter: IChapter) => ({
        ...chapter,
        lessons:
          chapter.lessons && Array.isArray(chapter.lessons)
            ? chapter.lessons.map((lesson: ILesson) => {
                const serializedLesson: ILesson = { ...lesson };

                if (
                  serializedLesson.docFile &&
                  Array.isArray(serializedLesson.docFile)
                ) {
                  serializedLesson.docFile = serializedLesson.docFile
                    .map(serializeFile)
                    .filter(notNull);
                }
                if (
                  serializedLesson.slideFile &&
                  Array.isArray(serializedLesson.slideFile)
                ) {
                  serializedLesson.slideFile = serializedLesson.slideFile
                    .map(serializeFile)
                    .filter(notNull);
                }
                if (
                  serializedLesson.videoFile &&
                  Array.isArray(serializedLesson.videoFile)
                ) {
                  serializedLesson.videoFile = serializedLesson.videoFile
                    .map(serializeFile)
                    .filter(notNull);
                }
                if (
                  serializedLesson.refDocFile &&
                  Array.isArray(serializedLesson.refDocFile)
                ) {
                  serializedLesson.refDocFile = serializedLesson.refDocFile
                    .map(serializeFile)
                    .filter(notNull);
                }

                return serializedLesson;
              })
            : chapter.lessons,
      }));
    }

    const nextMaxStep = Math.max(maxStep, currentStep, targetStep);
    setMaxStep(nextMaxStep);

    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ step: targetStep, maxStep: nextMaxStep, data: safeData })
    );
  };

  const getFieldsToValidate = (
    step: number
  ): (string | (string | number)[])[] => {
    if (step === 0) {
      const timeStateType = form.getFieldValue("timeStateType");
      const isHasBadge = form.getFieldValue("isHasBadge");

      const baseFields = [
        "title",
        "categories",
        "description",
        "thumbnail",
        "type",
        "publishAt",
        "isHasBadge",
        "isLearnInOrder",
      ];

      if (timeStateType === COURSE_TIME_STATE_TYPE.CUSTOMIZE.value) {
        baseFields.push("timeRange");
      }

      if (isHasBadge === COURSE_END_PRIZE.BADGE.value) {
        baseFields.push("courseBadgeFile");
      }

      return baseFields;
    }

    return [];
  };

  const validateStep = async (step?: number) => {
    const stepToValidate = step ?? currentStep;
    let isValid = true;

    try {
      if (stepToValidate === 0) {
        const fields = getFieldsToValidate(0);
        await form.validateFields(fields);
      } else if (stepToValidate === 1 || stepToValidate === 2) {
        await form.validateFields(["chapters"], { recursive: true });
      }
    } catch (_error: unknown) {
      isValid = false;
    }

    setHasValidationError(!isValid);

    if (!isValid) {
      const allErrors = form
        .getFieldsError()
        .filter((e) => e.errors.length > 0);
      if (allErrors.length > 0) {
        form.scrollToField(allErrors[0].name, {
          behavior: "smooth",
          block: "center",
        });
      }
    }

    return isValid;
  };

  const handleStepChange = async (targetStep: number) => {
    if (targetStep > currentStep) {
      const isValid = await validateStep();
      if (!isValid) return;
    }

    if (targetStep === 3) {
      setHasValidationError(false);
    }

    saveSnapshot(targetStep);
    setCurrentStep(targetStep);
  };

  const next = () => handleStepChange(currentStep + 1);
  const prev = () => handleStepChange(currentStep - 1);
  const goTo = (targetStep: number) => handleStepChange(targetStep);

  const mutation = useMutation({
    mutationFn: (values: ICourseApiPayload) => createCourseAPI(values),
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSuccess: () => {
      message.success("Đã tạo khóa học mới thành công!");
      localStorage.removeItem(DRAFT_KEY);
      form.resetFields();
      setIsFormDirty(false);
      navigate("/course-management/list");
    },
    onError: (err: unknown) => {
      message.error(getErrorMessage(err) || "Có lỗi xảy ra khi tạo khóa học");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = async () => {
    if (isSubmitting || mutation.isPending) {
      return;
    }

    try {
      setIsSubmitting(true);

      let allValid = true;
      for (let step = 0; step <= 2; step++) {
        const isValid = await validateStep(step);
        if (!isValid) {
          allValid = false;
          setCurrentStep(step);
          break;
        }
      }

      if (!allValid) {
        setIsSubmitting(false);
        return;
      }

      const rawValues = form.getFieldsValue(true);

      if (rawValues.publishAt && dayjs.isDayjs(rawValues.publishAt)) {
        if (rawValues.publishAt.isBefore(dayjs())) {
          rawValues.publishAt = dayjs();
          form.setFieldValue("publishAt", dayjs());
        }
      }

      const normalizedValues = normalizeEssayQuestions(
        rawValues as ICreateCourseForm
      );

      const sanitizeString = (text?: string | null) =>
        typeof text === "string" ? text.trim() : text ?? "";

      const sanitizePassRate = (value: unknown) => {
        const num = Number(value);
        if (Number.isNaN(num)) return PASS_RATE_MIN;
        return Math.min(PASS_RATE_MAX, Math.max(PASS_RATE_MIN, num));
      };

      type UiQuestion = IQuestion & {
        singleChoiceState?: number;
        multiChoiceState?: boolean[];
      };

      const sanitizedValues: ICreateCourseForm = {
        ...normalizedValues,
        title: sanitizeString(rawValues.title),
        description: sanitizeString(rawValues.description),
        chapters: (normalizedValues.chapters || []).map((chap: IChapter) => ({
          ...chap,
          title: sanitizeString(chap.title),
          lessons: (chap.lessons || []).map((lesson: ILesson) => ({
            ...lesson,
            title: sanitizeString(lesson.title),
            quizzes: (lesson.quizzes || []).map((quiz: IQuiz) => ({
              ...quiz,
              title: sanitizeString(quiz.title),
              examPassRate: sanitizePassRate(quiz.examPassRate),
              questions: (quiz.questions || []).map((q) => {
                const { singleChoiceState, multiChoiceState, ...restQuestion } =
                  q as UiQuestion;

                return {
                  ...restQuestion,
                  title: sanitizeString(restQuestion.title),
                  options: (restQuestion.options || []).map(
                    (ans: IAnswerOption) => ({
                      ...ans,
                      content: sanitizeString(ans.content),
                    })
                  ),
                };
              }),
            })),
          })),
        })),
      } as ICreateCourseForm;

      const apiPayload = mapUiToApiPayload(sanitizedValues);

      setHasValidationError(false);
      saveSnapshot(currentStep);

      mutation.mutate(apiPayload);
    } catch (e: unknown) {
      setIsSubmitting(false);
      setHasValidationError(true);
      message.error("Vui lòng kiểm tra lại form");

      if (e && typeof e === "object" && "errorFields" in e) {
        const validationError = e as {
          errorFields?: Array<{ name: (string | number)[] }>;
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

  useEffect(() => {
    const autosave = () => saveSnapshot(currentStep);

    const intervalId = window.setInterval(autosave, AUTOSAVE_INTERVAL_MS);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [currentStep]);

  return {
    currentStep,
    maxStep,
    form,
    next,
    prev,
    goTo,
    onSubmit,
    isSubmitting: isSubmitting || mutation.isPending,
    hasValidationError,
    setHasValidationError,
    handleFieldsChange,
    isFormDirty,
    confirmNavigation: (callback: () => void) => {
      if (isFormDirty && !isSubmitting) {
        if (
          window.confirm(
            "Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời khỏi trang?"
          )
        ) {
          setIsFormDirty(false);
          callback();
        }
      } else {
        callback();
      }
    },
  };
};
