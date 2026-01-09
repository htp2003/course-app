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
  singleChoiceState?: number;
  multipleChoiceState?: boolean[];
}

export interface IQuiz {
  id?: string | number;
  title: string;
  examPassRate?: number;

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
  courseId?: number;
  title: string;
  no?: number;
  lessons?: IApiLesson[];
  exams?: IApiExam[];
}

export interface IApiExam {
  id: number;
  title: string;
  description?: string;
  bannerUri?: string | null;
  itemId?: number;
  type?: number;
  minCorrectAns?: number;
  examTimeType?: number;
  ticks?: number;
  examPassRate?: number;
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
  publishAt?: string;
  startTime?: string | null;
  endTime?: string | null;
  ticks?: number;
  topics: string;
  courseBadgeUri?: string | null;
  courseTopics?: number[];
  totalRegister?: number;
  totalStudy?: number;
  chapters: IApiChapter[];
  exams?: IApiExam[];
  isLearnInOrder?: boolean;
}

export interface IApiLessonFile {
  id: number;
  type: number;
  lessonId?: number;
  courseId?: number;
  mediaFileId?: number;
  mediaFile: {
    id: number;
    fileName: string;
    uri: string;
    rawUri?: string;
    fileType: number;
    extensions?: string;
    content?: string;
  } | null;
}

export interface IApiLesson {
  id: number;
  title: string;
  description?: string;
  thumbnailUri?: string;
  no?: number;
  mediaUri?: string;
  videoUrl?: string;
  quizzes?: IApiQuiz[];
  type: number;
  exams?: IApiExam[];
  lessonFiles?: IApiLessonFile[];
  documentFiles?: IApiLessonFile[];
  chapterId?: number;
}
