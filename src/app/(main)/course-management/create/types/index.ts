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

// Form Request Body hoàn chỉnh
export interface TCreateCourseForm extends TCourseBasicInfo, TCourseContent {
  status: "draft" | "published";
}

export type TLessonType = "video" | "text" | "quiz" | "document";

export interface TLesson {
  id: string; // ID duy nhất để tìm kiếm (FE tự tạo)
  title: string; // Tên bài
  type: TLessonType; // Hình thức học
  duration: number;

  // Tài liệu bài học (Video URL hoặc nội dung Text)
  videoUrl?: string;
  content?: string;

  // Tài liệu tham khảo
  references?: string; // Link hoặc tên file

  isFree?: boolean; // Học thử hay không
}

export interface TChapter {
  id: string; // ID duy nhất
  title: string;
  lessons: TLesson[];
}
