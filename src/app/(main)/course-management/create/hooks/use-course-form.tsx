import { useState, useEffect } from "react";
import { Form, App, notification } from "antd";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import type { UploadFile } from "antd/es/upload/interface";

import { createCourseAPI } from "../services/api";
import { getErrorMessage } from "../../common/utils/utils";
import type {
  ICreateCourseForm,
  ILesson,
  IChapter,
  IQuiz,
} from "../../common/types/types";

import { mapUiToApiPayload } from "../utils/payload-mapper";

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

type FileWithResponse = UploadFile & {
  response?: {
    result?: {
      rawUrl?: string;
      compressUrl?: string;
      url?: string;
    };
    data?: {
      rawUrl?: string;
      url?: string;
    };
  };
};

const getUrlFromFile = (file: FileWithResponse): string | undefined => {
  if (file.url) return file.url;
  const resp = file.response;
  if (!resp) return undefined;
  return (
    resp.result?.rawUrl ||
    resp.result?.compressUrl ||
    resp.result?.url ||
    resp.data?.rawUrl ||
    resp.data?.url
  );
};

const serializeFile = (file: UploadFile): UploadFile => {
  const fileWithResp = file as FileWithResponse;
  const url = getUrlFromFile(fileWithResp);
  return {
    uid: file.uid ?? "",
    name: file.name ?? "",
    status: file.status,
    url,
    response: fileWithResp.response,
  } as UploadFile;
};

const deserializeFile = (file: UploadFile): UploadFile => {
  const fileWithResp = file as FileWithResponse;
  if (fileWithResp.url) return fileWithResp;
  const url = getUrlFromFile(fileWithResp);
  return url ? ({ ...fileWithResp, url } as UploadFile) : fileWithResp;
};

export const useCourseForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [form] = Form.useForm<ICreateCourseForm>();

  const navigate = useNavigate();
  const { message } = App.useApp();

  useEffect(() => {
    if (currentStep > maxStep) setMaxStep(currentStep);
  }, [currentStep, maxStep]);

  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const { step = 0, maxStep: storedMaxStep = 0, data } = JSON.parse(draft);

        if (data.timeRange && Array.isArray(data.timeRange)) {
          data.timeRange = [dayjs(data.timeRange[0]), dayjs(data.timeRange[1])];
        }

        if (data.publishAt) {
          data.publishAt = dayjs(data.publishAt);
        }

        if (data.thumbnail && Array.isArray(data.thumbnail)) {
          data.thumbnail = data.thumbnail.map(deserializeFile);
        }

        if (data.courseBadgeFile && Array.isArray(data.courseBadgeFile)) {
          data.courseBadgeFile = data.courseBadgeFile.map(deserializeFile);
        }

        if (data.chapters && Array.isArray(data.chapters)) {
          data.chapters = data.chapters.map((chapter: IChapter) => {
            if (chapter.lessons && Array.isArray(chapter.lessons)) {
              chapter.lessons = chapter.lessons.map((lesson: ILesson) => {
                if (lesson.docFile && Array.isArray(lesson.docFile)) {
                  lesson.docFile = lesson.docFile.map(deserializeFile);
                }
                if (lesson.slideFile && Array.isArray(lesson.slideFile)) {
                  lesson.slideFile = lesson.slideFile.map(deserializeFile);
                }
                if (lesson.videoFile && Array.isArray(lesson.videoFile)) {
                  lesson.videoFile = lesson.videoFile.map(deserializeFile);
                }
                if (lesson.refDocFile && Array.isArray(lesson.refDocFile)) {
                  lesson.refDocFile = lesson.refDocFile.map(deserializeFile);
                }
                return lesson;
              });
            }
            return chapter;
          });
        }

        form.setFieldsValue(data);
        setCurrentStep(step);
        setMaxStep(Math.max(storedMaxStep, step));
      } catch (e) {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, [form]);

  const saveSnapshot = (targetStep: number) => {
    const allData = form.getFieldsValue(true);

    const safeData: ICreateCourseForm = { ...allData } as ICreateCourseForm;

    if (safeData.thumbnail && Array.isArray(safeData.thumbnail)) {
      safeData.thumbnail = safeData.thumbnail.map(serializeFile);
    }

    if (safeData.courseBadgeFile && Array.isArray(safeData.courseBadgeFile)) {
      safeData.courseBadgeFile = safeData.courseBadgeFile.map(serializeFile);
    }

    if (safeData.chapters && Array.isArray(safeData.chapters)) {
      safeData.chapters = safeData.chapters.map((chapter: IChapter) => {
        if (chapter.lessons && Array.isArray(chapter.lessons)) {
          chapter.lessons = chapter.lessons.map((lesson: ILesson) => {
            const serializedLesson = { ...lesson } as ILesson;

            if (serializedLesson.docFile && Array.isArray(serializedLesson.docFile)) {
              serializedLesson.docFile = serializedLesson.docFile.map(serializeFile);
            }
            if (serializedLesson.slideFile && Array.isArray(serializedLesson.slideFile)) {
              serializedLesson.slideFile = serializedLesson.slideFile.map(serializeFile);
            }
            if (serializedLesson.videoFile && Array.isArray(serializedLesson.videoFile)) {
              serializedLesson.videoFile = serializedLesson.videoFile.map(serializeFile);
            }
            if (serializedLesson.refDocFile && Array.isArray(serializedLesson.refDocFile)) {
              serializedLesson.refDocFile = serializedLesson.refDocFile.map(serializeFile);
            }

            return serializedLesson;
          });
        }
        return chapter;
      });
    }

    const nextMaxStep = Math.max(maxStep, currentStep, targetStep);
    setMaxStep(nextMaxStep);

    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ step: targetStep, maxStep: nextMaxStep, data: safeData })
    );
  };

  const getFieldsToValidate = (): (string | (string | number)[])[] => {
    if (currentStep === 0) {
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
          // Do not show generic error message; field-level messages are visible.
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
    mutationFn: (values: ICourseApiPayload) => createCourseAPI(values),
    onSuccess: () => {
      notification.success({
        message: "Thành công",
        description: "Đã tạo khóa học mới!",
      });
      localStorage.removeItem(DRAFT_KEY);
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
    isSubmitting: mutation.isPending,
  };
};
