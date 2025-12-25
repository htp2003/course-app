import type { UploadFile } from "antd/es/upload/interface";
import type { Dayjs } from "dayjs";

export type CourseLevelType = string;
export type CourseStatusType = 0 | 1 | 2 | 3;
export type LessonTypeType = "video" | "document" | "slide";
export type QuestionType = "choice" | "essay";
export type CourseCategoryType = number | string | undefined;

export interface IAnswerOption {
  id?: string;
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

  questions: IQuestion[];
}

export interface ILesson {
  id?: string | number;
  title: string;
  type: LessonTypeType;
  duration: number;

  videoUrl?: string;
  content?: string;

  docFile?: UploadFile[];
  slideFile?: UploadFile[];
  videoFile?: UploadFile[];

  refDocFile?: UploadFile[];

  quizzes?: IQuiz[];
}

export interface IChapter {
  id?: string | number;
  title: string;
  lessons: ILesson[];
}

export interface ICreateCourseForm {
  title: string;
  description: string;
  status?: number;
  category: CourseCategoryType;
  type: number;
  timeStateType: number;
  isHasBadge: number;
  isLearnInOrder: boolean;

  publishAt: Dayjs;
  courseBadgeFile?: UploadFile[];

  timeRange: [Dayjs, Dayjs];
  thumbnail: UploadFile[];

  chapters: IChapter[];
}
