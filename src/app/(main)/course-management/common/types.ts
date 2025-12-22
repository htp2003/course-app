import type { UploadFile } from "antd/es/upload/interface";

export type CourseLevelType = 1 | 2 | 3 | 4;
export type CourseStatusType = 0 | 1 | 2 | 3;
export type LessonTypeType = "video" | "document" | "slide";
export type QuestionType = "choice" | "essay";
export type CourseCategoryType =
  | "it"
  | "design"
  | "business"
  | "marketing"
  | "language";

export interface IQuestion {
  id: string;
  title: string;
  type: QuestionType;
  score: number;

  isMultipleChoice?: boolean;
  options?: IAnswerOption[];
  explanation?: string;

  keywords?: string[];
}
export interface IAnswerOption {
  id: string;
  content: string;
  isCorrect: boolean;
}

export interface IQuiz {
  id: string;
  title: string;
  questions: IQuestion[];
  passingScore?: number;
  timeLimit?: number;
}

export interface ILesson {
  id: string;
  title: string;
  type: LessonTypeType;
  duration: number;
  videoUrl?: string;
  content?: string;
  docFile?: UploadFile;
  slideFile?: UploadFile;
  quizzes?: IQuiz[];
}

export interface IChapter {
  id: string;
  title: string;
  lessons: ILesson[];
}

export interface ICourseInfoBasic {
  title: string;
  price: number;
  level: CourseLevelType;
  category: CourseCategoryType;
  description?: string;
  thumbnail?: UploadFile[];
}

export interface ICreateCourseForm extends ICourseInfoBasic {
  chapters: IChapter[];
  status: CourseStatusType;
}
