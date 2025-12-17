export interface TCourseBasicInfo {
  title: string;
  description?: string;
  price: number;
  level: "beginner" | "intermediate" | "advanced";
  thumbnail?: string | File;
}

export interface TCourseContent {
  chapters: TChapter[];
}

export interface TCreateCourseForm extends TCourseBasicInfo, TCourseContent {
  status: "draft" | "published";
}

export type TLessonType = "video" | "text" | "quiz" | "document";

export interface TLesson {
  id: string;
  title: string;
  type: TLessonType;
  duration: number;

  videoUrl?: string;
  content?: string;

  references?: string;

  isFree?: boolean;
}

export interface TChapter {
  id: string;
  title: string;
  lessons: TLesson[];
}
