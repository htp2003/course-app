import dayjs from "dayjs";
import type { UploadFile } from "antd/es/upload/interface";
import type {
  ICreateCourseForm,
  IChapter,
  IQuiz,
  LessonTypeType,
  QuestionType,
} from "../types/types";
import type { TCourseDetailResponse } from "../types/api-response";

type TApiDetailData = TCourseDetailResponse["data"];

/**
 * Helper: Tạo object UploadFile giả
 */
const createMockFile = (
  url: string,
  id: number,
  name: string = "file"
): UploadFile => ({
  uid: `-${id}`,
  name: name,
  status: "done",
  url: url,
  response: { id: id, uri: url },
});

export const mapApiToUiForm = (apiData: TApiDetailData): ICreateCourseForm => {
  if (!apiData) return {} as ICreateCourseForm;

  let thumbnail: UploadFile[] = [];
  if (apiData.bannerUri) {
    thumbnail = [
      createMockFile(
        apiData.bannerUri,
        apiData.mediaFileId || 0,
        "thumbnail.png"
      ),
    ];
  }

  const timeRange: [dayjs.Dayjs, dayjs.Dayjs] = [
    apiData.startTime ? dayjs(apiData.startTime) : dayjs(),
    apiData.endTime ? dayjs(apiData.endTime) : dayjs().add(1, "month"),
  ];

  const chapters: IChapter[] = (apiData.chapters || []).map((chap) => ({
    id: chap.id,
    title: chap.title,
    lessons: (chap.lessons || []).map((less) => {
      const docFiles: UploadFile[] = [];
      const slideFiles: UploadFile[] = [];
      const videoFiles: UploadFile[] = [];

      if (less.lessonFiles) {
        less.lessonFiles.forEach((f) => {
          const fileObj = createMockFile(
            f.mediaFile?.uri,
            f.mediaFile?.id,
            f.mediaFile?.fileName
          );
          if (f.type === 2) docFiles.push(fileObj);
          else if (f.type === 3) slideFiles.push(fileObj);
        });
      }

      const uiQuizzes: IQuiz[] = [];

      if (less.exams) {
        less.exams.forEach((exam) => {
          uiQuizzes.push({
            id: exam.id,
            title: exam.title,
            questions: (exam.quizzes || []).map((q) => {
              const qType: QuestionType = q.type === 2 ? "essay" : "choice";

              return {
                id: q.id,
                title: q.content,
                type: qType,
                score: 1,
                explanation: q.explanation || "",
                options: (q.quizAns || []).map((ans) => ({
                  content: ans.content,
                  isCorrect: ans.isTrue,
                })),
              };
            }),
          });
        });
      }

      let uiType: LessonTypeType = "video";
      if (less.type === 2) uiType = "document";
      if (less.type === 3) uiType = "slide";

      return {
        id: less.id,
        title: less.title,
        duration: 0,
        type: uiType,
        docFile: docFiles,
        slideFile: slideFiles,
        videoFile: videoFiles,
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

    category: categoryId || undefined,

    description: apiData.description,
    thumbnail: thumbnail,
    timeRange: timeRange,
    chapters: chapters,
    status: apiData.timeStateType,
  };
};
