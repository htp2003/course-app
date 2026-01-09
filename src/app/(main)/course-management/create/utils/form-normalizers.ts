import type { UploadFile } from "antd/es/upload/interface";
import type { ICreateCourseForm } from "../../../course-management/common/types/types";

export type FileWithResponse = UploadFile & {
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

export const serializeFile = (file: UploadFile): UploadFile | null => {
  if (file.status === "uploading" || file.status === "error") {
    return null;
  }

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

export const deserializeFile = (file: UploadFile): UploadFile | null => {
  if (file.status === "uploading" || file.status === "error") {
    return null;
  }

  const fileWithResp = file as FileWithResponse;
  if (fileWithResp.url) return fileWithResp;
  const url = getUrlFromFile(fileWithResp);
  return url ? ({ ...fileWithResp, url } as UploadFile) : fileWithResp;
};

export const normalizeEssayQuestions = (
  data: ICreateCourseForm
): ICreateCourseForm => {
  const cloned = { ...data };

  cloned.chapters = (cloned.chapters || []).map((chap) => ({
    ...chap,
    lessons: (chap.lessons || []).map((lesson) => ({
      ...lesson,
      quizzes: (lesson.quizzes || []).map((quiz) => ({
        ...quiz,
        questions: (quiz.questions || []).map((q) =>
          q.type === "essay"
            ? {
                ...q,
                isMultipleChoice: false,
                options: [],
              }
            : q
        ),
      })),
    })),
  }));

  return cloned;
};
