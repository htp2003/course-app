import dayjs from "dayjs";
import type { UploadFile } from "antd/es/upload/interface";
import type {
  ICreateCourseForm,
  IQuestion,
  IAnswerOption,
} from "../../common/types/types";
import {
  COURSE_TIME_STATE_TYPE,
  COURSE_END_PRIZE,
} from "../../common/constants/constants";

interface IUploadResponse {
  result?: {
    mediaFileId?: number;
    id?: number;
    rawUrl?: string;
    url?: string;
    uri?: string;
  };
  data?: {
    id?: number;
    url?: string;
  };
  id?: number;
}

const getFileId = (fileList?: UploadFile[]): number => {
  if (!fileList || fileList.length === 0) return 0;
  const file = fileList[0];
  const response = file.response as IUploadResponse | undefined;
  if (!response) return 0;

  if (response.result?.mediaFileId) return response.result.mediaFileId;
  if (response.result?.id) return response.result.id;
  if (response.data?.id) return response.data.id;
  if (response.id) return response.id;
  return 0;
};

const getOriginalUrl = (fileList?: UploadFile[]): string => {
  if (!fileList || fileList.length === 0) return "";
  const file = fileList[0];
  const response = file.response as IUploadResponse | undefined;
  if (!response) return "";

  if (response.result?.rawUrl) return response.result.rawUrl;
  if (response.result?.url) return response.result.url;
  if (response.result?.uri) return response.result.uri;
  if (response.data?.url) return response.data.url;
  return "";
};

const getUrlWithExtension = (fileList?: UploadFile[]): string => {
  const url = getOriginalUrl(fileList);
  if (!url) return "";

  if (fileList && fileList[0]?.name) {
    const parts = fileList[0].name.split(".");
    if (parts.length > 1) {
      const ext = parts.pop()?.toLowerCase();
      if (ext && !url.toLowerCase().endsWith(`.${ext}`)) {
        return `${url}.${ext}`;
      }
    }
  }
  return url;
};

const getLessonTypeId = (type: string): number => {
  switch (type) {
    case "video":
      return 1;
    case "document":
      return 2;
    case "slide":
      return 3;
    default:
      return 1;
  }
};

interface IExtractedExam {
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
}

export const mapUiToApiPayload = (values: ICreateCourseForm) => {
  const extractedExams: IExtractedExam[] = [];
  const DATE_FORMAT = "YYYY-MM-DDTHH:mm:ss";

  const chaptersPayload = values.chapters.map((chap, cIdx) => {
    const chapterNo = cIdx + 1;

    const lessonsPayload = chap.lessons.map((less, lIdx) => {
      const lessonNo = lIdx + 1;
      const typeId = getLessonTypeId(less.type);

      let mainFiles: UploadFile[] = [];
      if (less.type === "video") mainFiles = less.videoFile || [];
      else if (less.type === "document") mainFiles = less.docFile || [];
      else if (less.type === "slide") mainFiles = less.slideFile || [];

      const mediaFileId = getFileId(mainFiles);
      const rawUrl = getUrlWithExtension(mainFiles);

      const refFiles = less.refDocFile || [];
      const documentMediaFileId = getFileId(refFiles);
      const docRawUrl = getUrlWithExtension(refFiles);

      if (less.quizzes && less.quizzes.length > 0) {
        less.quizzes.forEach((uiQuiz) => {
          extractedExams.push({
            title: uiQuiz.title,
            description: "",
            mediaFileId: 0,
            lessonNo: lessonNo,
            chapterNo: chapterNo,
            type: 1,
            examPassRate: 100,
            quizzes: (uiQuiz.questions || []).map((q: IQuestion) => ({
              content: q.title,
              type: 1,
              mediaFileId: 0,
              explanation: q.explanation ?? "",
              quizAns: (q.options || []).map((opt: IAnswerOption) => ({
                content: opt.content,
                isTrue: opt.isCorrect,
              })),
            })),
            quizIds: [],
          });
        });
      }

      return {
        title: less.title,
        no: lessonNo,
        type: typeId,
        description: less.content || "",

        mediaFileId: mediaFileId,
        rawUrl: rawUrl,

        documentMediaFileId: documentMediaFileId,
        docRawUrl: docRawUrl,

        thumbnailUri: "",
      };
    });

    return {
      title: chap.title,
      no: chapterNo,
      lessons: lessonsPayload,
    };
  });

  const toSafeDayjs = (value: unknown) => {
    if (!value) return dayjs();
    if (typeof value === "object" && value !== null && "$d" in value) {
      return dayjs((value as { $d: string | Date }).$d);
    }
    return dayjs(value as string | Date);
  };

  const publishAt = values.publishAt
    ? toSafeDayjs(values.publishAt).format(DATE_FORMAT)
    : dayjs().format(DATE_FORMAT);

  let startTime = null;
  let endTime = null;

  if (values.timeStateType === COURSE_TIME_STATE_TYPE.CUSTOMIZE.value) {
    if (values.timeRange && values.timeRange[0]) {
      startTime = toSafeDayjs(values.timeRange[0]).format(DATE_FORMAT);
    }
    if (values.timeRange && values.timeRange[1]) {
      endTime = toSafeDayjs(values.timeRange[1]).format(DATE_FORMAT);
    }
  }

  let courseBadgeFileId = 0;
  if (values.isHasBadge === COURSE_END_PRIZE.BADGE.value) {
    courseBadgeFileId = getFileId(values.courseBadgeFile);
  }

  const finalPayload = {
    title: values.title,
    description: values.description,

    mediaFileId: getFileId(values.thumbnail),
    bannerUri: getUrlWithExtension(values.thumbnail),

    type: values.type,
    timeStateType: values.timeStateType,
    isHasBadge: values.isHasBadge,
    courseBadgeFileId: courseBadgeFileId,

    publishAt: publishAt,
    startTime: startTime,
    endTime: endTime,

    chapters: chaptersPayload,
    exams: extractedExams,

    courseTopics: Array.isArray(values.categories)
      ? values.categories.map((c: number | string) => Number(c))
      : values.category
      ? [Number(values.category)]
      : [],
    isLearnInOrder: values.isLearnInOrder ?? true,
  };

  return finalPayload;
};
