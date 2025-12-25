export type TApiQuizAns = {
  id: number;
  content: string;
  isTrue: boolean;
};

export type TApiQuiz = {
  id: number;
  content: string;
  explanation: string | null;
  type: number;
  quizAns: TApiQuizAns[];
};

export type TApiExam = {
  id?: number;
  itemId?: number;
  title: string;
  quizzes: TApiQuiz[];
};

export type TApiMediaFile = {
  id: number;
  uri: string;
  fileName: string;
  fileType: number;
};

export type TApiLessonFile = {
  id: number;
  type: number;
  mediaFileId: number;
  mediaFile: TApiMediaFile;
};

export type TApiLesson = {
  id: number;
  title: string;
  description: string;
  no: number;
  type: number;
  lessonFiles: TApiLessonFile[];
  exams: TApiExam[];
};

export type TApiChapter = {
  courseId: number;
  id?: number;
  title: string;
  no: number;
  lessons: TApiLesson[];
};

export type TCourseDetailResponse = {
  statusCode: number;
  message: string;
  data: {
    id: number;
    title: string;
    description: string;
    bannerUri: string | null;
    type: number;
    status: number;
    timeStateType: number;
    publishAt: string;
    startTime: string | null;
    endTime: string | null;
    topics: string;
    totalRegister: number;
    chapters: TApiChapter[];
    isLearnInOrder: boolean;
    mediaFileId?: number;
    courseTopics: number[];
  };
};

export interface IUploadResponse {
  id: number;
  uri: string;
  url?: string;
  [key: string]: unknown;
}

export type TUploadApiCall = (
  file: File
) => Promise<{ data: IUploadResponse } | IUploadResponse>;
