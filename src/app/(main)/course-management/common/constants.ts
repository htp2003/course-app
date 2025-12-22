export const COURSE_LEVELS = [
  { label: "Người mới", value: 1 },
  { label: "Trung cấp", value: 2 },
  { label: "Nâng cao", value: 3 },
  { label: "Chuyên gia", value: 4 },
];

export const COURSE_CATEGORIES = [
  { label: "Công nghệ thông tin", value: "it" },
  { label: "Thiết kế đồ họa", value: "design" },
  { label: "Kinh doanh & Startup", value: "business" },
  { label: "Marketing", value: "marketing" },
  { label: "Ngoại ngữ", value: "language" },
];

export const COURSE_STATUSES = [
  { label: "Bản nháp", value: 0 },
  { label: "Chờ duyệt", value: 1 },
  { label: "Đang hoạt động", value: 2 },
  { label: "Bị từ chối", value: 3 },
];

export const LESSON_TYPES = [
  { label: "Video bài giảng", value: "video" },
  { label: "Tài liệu đọc", value: "document" },
  { label: "Slide thuyết trình", value: "slide" },
];

export const QUESTION_TYPES = [
  { label: "Trắc nghiệm", value: "choice" },
  { label: "Tự luận", value: "essay" },
];

export const QUESTION_TYPE_MAP = {
  CHOICE: "choice",
  ESSAY: "essay",
};

export const UPLOAD_CONFIG = {
  IMAGE: {
    MAX_SIZE_MB: 5,
    ACCEPT: "image/png, image/jpeg, image/jpg, image/webp",
    HELPER_TEXT: "Hỗ trợ: PNG, JPG, WEBP (Max 5MB)",
  },
  DOCUMENT: {
    MAX_SIZE_MB: 20,
    ACCEPT: ".pdf, .doc, .docx",
    HELPER_TEXT: "Hỗ trợ: PDF, DOC, DOCX (Max 20MB)",
  },
  SLIDE: {
    MAX_SIZE_MB: 20,
    ACCEPT: ".ppt, .pptx, .pdf",
    HELPER_TEXT: "Hỗ trợ: PowerPoint, PDF (Max 20MB)",
  },
  VIDEO: {
    MAX_SIZE_MB: 500,
    ACCEPT:
      "video/mp4, video/mov, video/avi, video/mkv, video/quicktime, video/webm",
    HELPER_TEXT: "Hỗ trợ: MP4, MOV, AVI, MKV, WEBM (Max 500MB)",
  },
} as const;

export const ASPECT_RATIOS = {
  VIDEO: 16 / 9,
  SQUARE: 1,
  PORTRAIT: 3 / 4,
  LANDSCAPE: 4 / 3,
} as const;

export const ASPECT_RATIO_TOLERANCE = 0.02;
