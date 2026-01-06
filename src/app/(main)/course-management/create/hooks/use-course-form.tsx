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
const AUTOSAVE_INTERVAL_MS = 2 * 60 * 1000;
const PASS_RATE_MIN = 0;
const PASS_RATE_MAX = 100;

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
        const {
          step = 0,
          maxStep: storedMaxStep = 0,
          data,
        } = JSON.parse(draft);

        const transformedData = {
          ...data,
          timeRange:
            data.timeRange && Array.isArray(data.timeRange)
              ? [dayjs(data.timeRange[0]), dayjs(data.timeRange[1])]
              : data.timeRange,
          publishAt: data.publishAt ? dayjs(data.publishAt) : data.publishAt,
          thumbnail:
            data.thumbnail && Array.isArray(data.thumbnail)
              ? data.thumbnail
                  .map(deserializeFile)
                  .filter((f: UploadFile | null): f is UploadFile => f !== null)
              : data.thumbnail,
          courseBadgeFile:
            data.courseBadgeFile && Array.isArray(data.courseBadgeFile)
              ? data.courseBadgeFile
                  .map(deserializeFile)
                  .filter((f: UploadFile | null): f is UploadFile => f !== null)
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
                                  .map(deserializeFile)
                                  .filter(
                                    (f: UploadFile | null): f is UploadFile =>
                                      f !== null
                                  )
                              : lesson.docFile,
                          slideFile:
                            lesson.slideFile && Array.isArray(lesson.slideFile)
                              ? lesson.slideFile
                                  .map(deserializeFile)
                                  .filter(
                                    (f: UploadFile | null): f is UploadFile =>
                                      f !== null
                                  )
                              : lesson.slideFile,
                          videoFile:
                            lesson.videoFile && Array.isArray(lesson.videoFile)
                              ? lesson.videoFile
                                  .map(deserializeFile)
                                  .filter(
                                    (f: UploadFile | null): f is UploadFile =>
                                      f !== null
                                  )
                              : lesson.videoFile,
                          refDocFile:
                            lesson.refDocFile &&
                            Array.isArray(lesson.refDocFile)
                              ? lesson.refDocFile
                                  .map(deserializeFile)
                                  .filter(
                                    (f: UploadFile | null): f is UploadFile =>
                                      f !== null
                                  )
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
        localStorage.removeItem(DRAFT_KEY);
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
        .filter((f: UploadFile | null): f is UploadFile => f !== null);
    }

    if (safeData.courseBadgeFile && Array.isArray(safeData.courseBadgeFile)) {
      safeData.courseBadgeFile = safeData.courseBadgeFile
        .map(serializeFile)
        .filter((f: UploadFile | null): f is UploadFile => f !== null);
    }

    if (safeData.chapters && Array.isArray(safeData.chapters)) {
      safeData.chapters = safeData.chapters.map((chapter: IChapter) => {
        if (chapter.lessons && Array.isArray(chapter.lessons)) {
          chapter.lessons = chapter.lessons.map((lesson: ILesson) => {
            const serializedLesson = { ...lesson } as ILesson;

            if (
              serializedLesson.docFile &&
              Array.isArray(serializedLesson.docFile)
            ) {
              serializedLesson.docFile = serializedLesson.docFile
                .map(serializeFile)
                .filter((f: UploadFile | null): f is UploadFile => f !== null);
            }
            if (
              serializedLesson.slideFile &&
              Array.isArray(serializedLesson.slideFile)
            ) {
              serializedLesson.slideFile = serializedLesson.slideFile
                .map(serializeFile)
                .filter((f: UploadFile | null): f is UploadFile => f !== null);
            }
            if (
              serializedLesson.videoFile &&
              Array.isArray(serializedLesson.videoFile)
            ) {
              serializedLesson.videoFile = serializedLesson.videoFile
                .map(serializeFile)
                .filter((f: UploadFile | null): f is UploadFile => f !== null);
            }
            if (
              serializedLesson.refDocFile &&
              Array.isArray(serializedLesson.refDocFile)
            ) {
              serializedLesson.refDocFile = serializedLesson.refDocFile
                .map(serializeFile)
                .filter((f: UploadFile | null): f is UploadFile => f !== null);
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

    const chapters = form.getFieldValue("chapters") || [];
    const paths: (string | (string | number)[])[] = [];

    if (step === 1) {
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
            } else if (less.type === "video") {
              paths.push([...lessonPath, "videoFile"]);
            }
          });
        }
      });
    }

    if (step === 2) {
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
                paths.push([...quizPath, "examPassRate"]);

                if (quiz.questions) {
                  quiz.questions.forEach((_question, questionIdx: number) => {
                    const questionPath = [
                      ...quizPath,
                      "questions",
                      questionIdx,
                    ];
                    paths.push([...questionPath, "title"]);
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

  const validateCurrentStep = async (step?: number) => {
    const stepToValidate = step ?? currentStep;
    try {
      const fields = getFieldsToValidate(stepToValidate);

      if (stepToValidate === 0) {
        const thumbnail = form.getFieldValue("thumbnail") as
          | UploadFile[]
          | undefined;
        if (thumbnail && thumbnail.some((f) => f.status === "error")) {
          message.error("Ảnh bìa upload thất bại, vui lòng thử lại");
          setHasValidationError(true);
          return false;
        }

        const courseBadgeFile = form.getFieldValue("courseBadgeFile") as
          | UploadFile[]
          | undefined;
        const isHasBadge = form.getFieldValue("isHasBadge");
        if (
          isHasBadge === COURSE_END_PRIZE.BADGE.value &&
          courseBadgeFile &&
          courseBadgeFile.some((f) => f.status === "error")
        ) {
          message.error("Ảnh huy chương upload thất bại, vui lòng thử lại");
          setHasValidationError(true);
          return false;
        }
      }
      stepToValidate;
      if (currentStep === 1) {
        const chapters = form.getFieldValue("chapters");
        if (!chapters || chapters.length === 0) {
          message.error("Vui lòng tạo ít nhất 1 Chương nội dung!");
          setHasValidationError(true);
          return false;
        }
        const hasLesson = chapters.some(
          (ch: IChapter) => ch.lessons && ch.lessons.length > 0
        );
        if (!hasLesson) {
          message.error("Vui lòng tạo ít nhất 1 Bài học!");
          setHasValidationError(true);
          return false;
        }

        const chapterTitles = new Set<string>();
        for (let cIdx = 0; cIdx < chapters.length; cIdx++) {
          const chapter = chapters[cIdx] as IChapter;
          const chapterTitle = (chapter.title || "").trim();

          if (chapterTitle.length < 3) {
            message.error(`Tên Chương ${cIdx + 1} phải có ít nhất 3 ký tự`);
            form.scrollToField(["chapters", cIdx, "title"], {
              behavior: "smooth",
              block: "center",
            });
            setHasValidationError(true);
            return false;
          }

          if (!chapter.lessons || chapter.lessons.length === 0) {
            message.error(`Chương "${chapterTitle}" phải có ít nhất 1 Bài học`);
            form.scrollToField(["chapters", cIdx, "title"], {
              behavior: "smooth",
              block: "center",
            });
            setHasValidationError(true);
            return false;
          }

          const normalizedTitle = chapterTitle.toLowerCase();
          if (chapterTitles.has(normalizedTitle)) {
            message.error(
              `Tên Chương "${chapterTitle}" bị trùng với chương khác`
            );
            form.scrollToField(["chapters", cIdx, "title"], {
              behavior: "smooth",
              block: "center",
            });
            setHasValidationError(true);
            return false;
          }
          chapterTitles.add(normalizedTitle);

          if (chapter.lessons && chapter.lessons.length > 0) {
            const lessonTitles = new Set<string>();
            for (let lIdx = 0; lIdx < chapter.lessons.length; lIdx++) {
              const lesson = chapter.lessons[lIdx] as ILesson;
              const lessonTitle = (lesson.title || "").trim();

              if (lessonTitle.length < 3) {
                message.error(
                  `Tên Bài học ${
                    lIdx + 1
                  } trong Chương "${chapterTitle}" phải có ít nhất 3 ký tự`
                );
                form.scrollToField(
                  ["chapters", cIdx, "lessons", lIdx, "title"],
                  {
                    behavior: "smooth",
                    block: "center",
                  }
                );
                setHasValidationError(true);
                return false;
              }

              const normalizedLessonTitle = lessonTitle.toLowerCase();
              if (lessonTitles.has(normalizedLessonTitle)) {
                message.error(
                  `Tên Bài học "${lessonTitle}" bị trùng trong Chương "${chapterTitle}"`
                );
                form.scrollToField(
                  ["chapters", cIdx, "lessons", lIdx, "title"],
                  {
                    behavior: "smooth",
                    block: "center",
                  }
                );
                setHasValidationError(true);
                return false;
              }
              lessonTitles.add(normalizedLessonTitle);

              const hasVideoError =
                lesson.type === "video" &&
                lesson.videoFile &&
                lesson.videoFile.some((f: UploadFile) => f.status === "error");
              const hasDocError =
                lesson.type === "document" &&
                lesson.docFile &&
                lesson.docFile.some((f: UploadFile) => f.status === "error");
              const hasSlideError =
                lesson.type === "slide" &&
                lesson.slideFile &&
                lesson.slideFile.some((f: UploadFile) => f.status === "error");
              const hasRefDocError =
                lesson.refDocFile &&
                lesson.refDocFile.some((f: UploadFile) => f.status === "error");

              if (hasVideoError || hasDocError || hasSlideError) {
                message.error(
                  `File chính của Bài học "${lessonTitle}" upload thất bại, vui lòng thử lại`
                );
                form.scrollToField(["chapters", cIdx, "lessons", lIdx], {
                  behavior: "smooth",
                  block: "center",
                });
                setHasValidationError(true);
                return false;
              }

              if (hasRefDocError) {
                message.error(
                  `Tài liệu tham khảo của Bài học "${lessonTitle}" upload thất bại, vui lòng thử lại`
                );
                form.scrollToField(["chapters", cIdx, "lessons", lIdx], {
                  behavior: "smooth",
                  block: "center",
                });
                setHasValidationError(true);
                return false;
              }
            }
          }
        }
      }
      stepToValidate;
      if (currentStep === 2) {
        const chapters = form.getFieldValue("chapters") || [];
        for (let cIdx = 0; cIdx < chapters.length; cIdx++) {
          const chapter = chapters[cIdx] as IChapter;
          if (!chapter.lessons) continue;

          for (let lIdx = 0; lIdx < chapter.lessons.length; lIdx++) {
            const lesson = chapter.lessons[lIdx];
            if (!lesson.quizzes) continue;

            for (let qIdx = 0; qIdx < lesson.quizzes.length; qIdx++) {
              const quiz = lesson.quizzes[qIdx] as IQuiz;
              const passRate = Number(quiz.examPassRate);
              if (
                Number.isNaN(passRate) ||
                passRate < PASS_RATE_MIN ||
                passRate > PASS_RATE_MAX
              ) {
                message.error(
                  `Tỉ lệ đạt của quiz "${
                    quiz.title || "(không tên)"
                  }" phải từ 0 đến 100`
                );
                form.scrollToField(
                  [
                    "chapters",
                    cIdx,
                    "lessons",
                    lIdx,
                    "quizzes",
                    qIdx,
                    "examPassRate",
                  ],
                  { behavior: "smooth", block: "center" }
                );
                setHasValidationError(true);
                return false;
              }

              if (!quiz.questions || quiz.questions.length === 0) {
                message.error(
                  `Quiz "${quiz.title || "(không tên)"}" cần ít nhất 1 câu hỏi`
                );
                form.scrollToField(
                  ["chapters", cIdx, "lessons", lIdx, "quizzes", qIdx],
                  { behavior: "smooth", block: "center" }
                );
                setHasValidationError(true);
                return false;
              }
              const seenQuestionTitles = new Set<string>();

              for (
                let questionIdx = 0;
                questionIdx < quiz.questions.length;
                questionIdx++
              ) {
                const question = quiz.questions[questionIdx] as IQuestion;
                const rawTitle = question.title || "";
                const normalizedTitle = rawTitle.trim();

                if (!normalizedTitle) {
                  message.error(
                    `Câu hỏi ${questionIdx + 1} trong quiz "${
                      quiz.title
                    }" cần nhập nội dung`
                  );
                  form.scrollToField(
                    [
                      "chapters",
                      cIdx,
                      "lessons",
                      lIdx,
                      "quizzes",
                      qIdx,
                      "questions",
                      questionIdx,
                      "title",
                    ],
                    { behavior: "smooth", block: "center" }
                  );
                  setHasValidationError(true);
                  return false;
                }

                const normalizedKey = normalizedTitle.toLowerCase();
                if (seenQuestionTitles.has(normalizedKey)) {
                  message.error(
                    `Câu hỏi ${questionIdx + 1} trong quiz "${
                      quiz.title
                    }" trùng nội dung với câu trước`
                  );
                  form.scrollToField(
                    [
                      "chapters",
                      cIdx,
                      "lessons",
                      lIdx,
                      "quizzes",
                      qIdx,
                      "questions",
                      questionIdx,
                      "title",
                    ],
                    { behavior: "smooth", block: "center" }
                  );
                  setHasValidationError(true);
                  return false;
                }
                seenQuestionTitles.add(normalizedKey);

                if (question.type === "essay") continue;

                const options = question.options || [];
                const isMulti = question.isMultipleChoice ?? false;

                if (options.length < 2) {
                  message.error(
                    `Câu hỏi ${questionIdx + 1} trong quiz "${
                      quiz.title
                    }" cần ít nhất 2 đáp án`
                  );
                  form.scrollToField(
                    [
                      "chapters",
                      cIdx,
                      "lessons",
                      lIdx,
                      "quizzes",
                      qIdx,
                      "questions",
                      questionIdx,
                      "title",
                    ],
                    { behavior: "smooth", block: "center" }
                  );
                  setHasValidationError(true);
                  return false;
                }

                if (isMulti && options.length < 3) {
                  message.error(
                    `Chế độ nhiều đáp án đúng cần ít nhất 3 đáp án (Câu hỏi ${
                      questionIdx + 1
                    } trong quiz "${quiz.title}")`
                  );
                  form.scrollToField(
                    [
                      "chapters",
                      cIdx,
                      "lessons",
                      lIdx,
                      "quizzes",
                      qIdx,
                      "questions",
                      questionIdx,
                      "title",
                    ],
                    { behavior: "smooth", block: "center" }
                  );
                  setHasValidationError(true);
                  return false;
                }

                const emptyOptions = options.filter(
                  (o: IAnswerOption) => !(o?.content || "").trim()
                );
                if (emptyOptions.length > 0) {
                  message.error(
                    `Vui lòng điền nội dung tất cả đáp án (Câu hỏi ${
                      questionIdx + 1
                    } trong quiz "${quiz.title}")`
                  );
                  form.scrollToField(
                    [
                      "chapters",
                      cIdx,
                      "lessons",
                      lIdx,
                      "quizzes",
                      qIdx,
                      "questions",
                      questionIdx,
                      "title",
                    ],
                    { behavior: "smooth", block: "center" }
                  );
                  setHasValidationError(true);
                  return false;
                }

                const contents = options.map((o: IAnswerOption) =>
                  (o?.content || "").trim().toLowerCase()
                );
                const uniqueContents = new Set(contents);
                if (uniqueContents.size !== contents.length) {
                  message.error(
                    `Nội dung đáp án không được trùng nhau (Câu hỏi ${
                      questionIdx + 1
                    } trong quiz "${quiz.title}")`
                  );
                  form.scrollToField(
                    [
                      "chapters",
                      cIdx,
                      "lessons",
                      lIdx,
                      "quizzes",
                      qIdx,
                      "questions",
                      questionIdx,
                      "title",
                    ],
                    { behavior: "smooth", block: "center" }
                  );
                  setHasValidationError(true);
                  return false;
                }

                const correctCount = options.filter(
                  (o: IAnswerOption) => o?.isCorrect
                ).length;

                if (!isMulti) {
                  if (correctCount !== 1) {
                    message.error(
                      `Chế độ một đáp án đúng: vui lòng chọn đúng 1 đáp án (Câu hỏi ${
                        questionIdx + 1
                      } trong quiz "${quiz.title}")`
                    );
                    form.scrollToField(
                      [
                        "chapters",
                        cIdx,
                        "lessons",
                        lIdx,
                        "quizzes",
                        qIdx,
                        "questions",
                        questionIdx,
                        "title",
                      ],
                      { behavior: "smooth", block: "center" }
                    );
                    setHasValidationError(true);
                    return false;
                  }
                } else {
                  if (correctCount < 1) {
                    message.error(
                      `Vui lòng chọn ít nhất 1 đáp án đúng (Câu hỏi ${
                        questionIdx + 1
                      } trong quiz "${quiz.title}")`
                    );
                    form.scrollToField(
                      [
                        "chapters",
                        cIdx,
                        "lessons",
                        lIdx,
                        "quizzes",
                        qIdx,
                        "questions",
                        questionIdx,
                        "title",
                      ],
                      { behavior: "smooth", block: "center" }
                    );
                    setHasValidationError(true);
                    return false;
                  }
                  if (correctCount === options.length) {
                    message.error(
                      `Phải có ít nhất 1 đáp án không đúng trong chế độ nhiều đáp án (Câu hỏi ${
                        questionIdx + 1
                      } trong quiz "${quiz.title}")`
                    );
                    form.scrollToField(
                      [
                        "chapters",
                        cIdx,
                        "lessons",
                        lIdx,
                        "quizzes",
                        qIdx,
                        "questions",
                        questionIdx,
                        "title",
                      ],
                      { behavior: "smooth", block: "center" }
                    );
                    setHasValidationError(true);
                    return false;
                  }
                }
              }
            }
          }
        }
      }

      if (fields.length > 0) {
        await form.validateFields(fields);
      }

      setHasValidationError(false);
      return true;
    } catch (error: unknown) {
      if (error && typeof error === "object" && "errorFields" in error) {
        const validationError = error as {
          errorFields?: Array<{ name: (string | number)[] }>;
        };
        if (validationError.errorFields?.length) {
          form.scrollToField(validationError.errorFields[0].name, {
            behavior: "smooth",
            block: "center",
          });
        }
      }
      setHasValidationError(true);
      return false;
    }
  };

  const handleStepChange = async (targetStep: number) => {
    if (targetStep > currentStep) {
      const isValid = await validateCurrentStep();
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
  });

  const onSubmit = async () => {
    if (isSubmitting || mutation.isPending) {
      return;
    }

    try {
      setIsSubmitting(true);

      for (let step = 0; step <= 2; step++) {
        const isValid = await validateCurrentStep(step);

        if (!isValid) {
          setIsSubmitting(false);
          return;
        }
      }

      const rawValues = form.getFieldsValue(true);

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
              questions: (quiz.questions || []).map((q: IQuestion) => ({
                ...q,
                title: sanitizeString(q.title),
                options: (q.options || []).map((ans: IAnswerOption) => ({
                  ...ans,
                  content: sanitizeString(ans.content),
                })),
              })),
            })),
          })),
        })),
      } as ICreateCourseForm;

      const apiPayload = mapUiToApiPayload(sanitizedValues);

      setHasValidationError(false);
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
    isSubmitting: mutation.isPending,
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
