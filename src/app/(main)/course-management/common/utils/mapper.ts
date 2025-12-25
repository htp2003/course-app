import dayjs from "dayjs";
import type { UploadFile } from "antd/es/upload/interface";
import type {
  ICreateCourseForm,
  IChapter,
  IQuiz,
  LessonTypeType,
  QuestionType,
  IQuestion,
} from "../types/types";

const createMockFile = (
  url?: string,
  id?: number,
  name: string = "file"
): UploadFile[] => {
  if (!url) return [];
  return [
    {
      uid: `-${id || Date.now()}`,
      name: name,
      status: "done",
      url: url,
      response: { result: { id: id, mediaFileId: id, rawUrl: url, url: url } },
    },
  ];
};

export const mapApiToUiForm = (apiData: any): ICreateCourseForm => {
  if (!apiData) return {} as ICreateCourseForm;

  let timeRange: [dayjs.Dayjs, dayjs.Dayjs] | undefined = undefined;
  if (apiData.timeStateType === 1 && apiData.startTime && apiData.endTime) {
    timeRange = [dayjs(apiData.startTime), dayjs(apiData.endTime)];
  }

  const publishAt = apiData.publishAt ? dayjs(apiData.publishAt) : dayjs();

  const thumbnail = createMockFile(
    apiData.bannerUri,
    apiData.mediaFileId || 0,
    "thumbnail.png"
  );

  const courseBadgeFile = createMockFile(
    apiData.courseBadgeUri || apiData.badgeUri,
    apiData.courseBadgeFileId || 0,
    "badge.png"
  );

  const chapters: IChapter[] = (apiData.chapters || []).map((chap: any) => ({
    id: chap.id,
    title: chap.title,
    lessons: (chap.lessons || []).map((less: any) => {
      let uiType: LessonTypeType = "video";
      if (less.type === 2) uiType = "video";
      else if (less.type === 3) uiType = "document";

      const mainFileUrl =
        less.mediaFile?.rawUrl || less.rawUrl || less.mediaFile?.uri;
      const mainFileId = less.mediaFile?.id || less.mediaFileId;
      const mainFileName = less.mediaFile?.fileName || "main-content";

      const mainFileObj = createMockFile(mainFileUrl, mainFileId, mainFileName);

      let videoFile: UploadFile[] = [];
      let docFile: UploadFile[] = [];
      let slideFile: UploadFile[] = [];

      if (less.type === 1) videoFile = mainFileObj;
      else if (less.type === 3) docFile = mainFileObj;

      const refFileUrl =
        less.documentMediaFile?.rawUrl ||
        less.docRawUrl ||
        less.documentMediaFile?.uri;
      const refFileId = less.documentMediaFile?.id || less.documentMediaFileId;
      const refFileName = less.documentMediaFile?.fileName || "reference-doc";

      const refDocFile = createMockFile(refFileUrl, refFileId, refFileName);

      const uiQuizzes: IQuiz[] = [];
      if (less.exams) {
        less.exams.forEach((exam: any) => {
          uiQuizzes.push({
            id: exam.id,
            title: exam.title,
            questions: (exam.quizzes || []).map((q: any) => {
              const qType: QuestionType = q.type === 2 ? "essay" : "choice";
              return {
                id: q.id,
                title: q.content,
                type: qType,
                score: 1,
                explanation: q.explanation || "",
                options: (q.quizAns || []).map((ans: any) => ({
                  id: ans.id,
                  content: ans.content,
                  isCorrect: ans.isTrue,
                })),
              } as IQuestion;
            }),
          });
        });
      }

      return {
        id: less.id,
        title: less.title,
        duration: less.duration || 0,
        type: less.type === 1 ? "video" : "document",

        videoFile: videoFile,
        docFile: docFile,
        slideFile: slideFile,
        refDocFile: refDocFile,

        quizzes: uiQuizzes,
      };
    }),
  }));

  const categoryId =
    apiData.courseTopics && apiData.courseTopics.length > 0
      ? apiData.courseTopics[0]
      : Number(apiData.topics);

  return {
    title: apiData.title,
    description: apiData.description,

    type: apiData.type,
    timeStateType: apiData.timeStateType,
    isHasBadge: apiData.isHasBadge,
    isLearnInOrder: apiData.isLearnInOrder,

    publishAt: publishAt,
    timeRange: timeRange,

    thumbnail: thumbnail,
    courseBadgeFile: courseBadgeFile,

    category: categoryId || undefined,
    status: apiData.status,

    chapters: chapters,
  };
};
