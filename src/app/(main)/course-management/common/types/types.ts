import type { UploadFile } from "antd/es/upload/interface";
import type { Dayjs } from "dayjs";

export type CourseLevelType = string;
export type CourseStatusType = 0 | 1 | 2 | 3;
export type LessonTypeType = "video" | "document" | "slide";
export type QuestionType = "choice" | "essay";
export type CourseCategoryType = number | string | undefined;

export interface IAnswerOption {
  id?: string | number;
  content: string;
  isCorrect: boolean;
}

export interface IQuestion {
  id?: string | number;
  title: string;
  type: QuestionType;
  score: number;

  isMultipleChoice?: boolean;
  options?: IAnswerOption[];
  explanation?: string;

  keywords?: string[];
}

export interface IQuiz {
  id?: string | number;
  title: string;

  content?: string;
  questions?: IQuestion[];
  options?: IAnswerOption[];
  isMultiSelect?: boolean;
  type?: number;
  explanation?: string;
}
export interface IExam {
  id?: number | string;
  title: string;
  description?: string;
  quizzes: IQuiz[];
  type?: number;
  passRate?: number;
}

export interface IDocument {
  id: number | string;
  name: string;
  url: string;
  type?: string;
}

export interface ILesson {
  id?: string | number;
  title: string;
  type: LessonTypeType;
  duration: number;
  description?: string;
  videoUrl?: string;
  content?: string;

  docFile?: UploadFile[];
  slideFile?: UploadFile[];
  videoFile?: UploadFile[];

  refDocFile?: UploadFile[];
  documents?: IDocument[];
  quizzes?: IQuiz[];
  exams?: IExam[];
}

export interface IChapter {
  id?: string | number;
  title: string;
  lessons: ILesson[];
}

export interface ICreateCourseForm {
  id?: string | number;
  title: string;
  description: string;
  status?: number;
  category: CourseCategoryType;
  categories?: number[];
  type: number;
  timeStateType: number;
  isHasBadge: number;
  isLearnInOrder: boolean;

  publishAt: Dayjs;
  courseBadgeFile?: UploadFile[];

  timeRange: [Dayjs, Dayjs];
  thumbnail: UploadFile[];

  chapters: IChapter[];
  exams: IExam[];
}

export interface IApiQuizOption {
  id: number;
  content: string;
  isCorrect: boolean;
  isTrue?: boolean;
}

export interface IApiQuiz {
  id: number;
  content?: string;
  title?: string;
  quizAns?: IApiQuizOption[];
  quizOptions?: IApiQuizOption[];
  options?: IApiQuizOption[];
  explanation?: string;
  type: number;
}

export interface IApiChapter {
  id: number;
  title: string;
  lessons?: IApiLesson[];
}

export interface IApiExam {
  id: number;
  title: string;
  description?: string;
  quizzes?: IApiQuiz[];
}

export interface ICourseDetailResponse {
  id: number;
  title: string;
  description: string;
  bannerUri: string | null;
  type: number;
  status: number;
  timeStateType: number;
  topics: string;
  chapters: IApiChapter[];
  exams: IApiExam[];
  publishAt?: string;
  startTime?: string;
  endTime?: string;
}

export interface IApiLessonFile {
  id: number;
  mediaFile: {
    id: number;
    fileName: string;
    uri: string;
    fileType: number;
  } | null;
}

export interface IApiLesson {
  id: number;
  title: string;
  description?: string;
  mediaUri?: string;
  videoUrl?: string;
  quizzes?: IApiQuiz[];
  type: number;
  exams?: IApiExam[];
  lessonFiles?: IApiLessonFile[];
}
