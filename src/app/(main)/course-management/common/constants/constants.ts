import { keyBy } from "lodash";

export const COURSE_LEVELS = [
  { label: "Người mới", value: 1 },
  { label: "Trung cấp", value: 2 },
  { label: "Nâng cao", value: 3 },
  { label: "Chuyên gia", value: 4 },
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

export const API_LESSON_FILE_TYPE = {
  VIDEO: 1,
  DOCUMENT: 2,
  SLIDE: 3,
} as const;

export const API_LESSON_TYPE = {
  VIDEO: 1,
  DOCUMENT: 2,
  SLIDE: 3,
} as const;

export const API_QUESTION_TYPE = {
  CHOICE: 1,
  ESSAY: 2,
} as const;

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
      "video/mp4, video/mov, video/avi, video/mkv, video/quicktime, video/webm, .mp4, .mov, .avi, .mkv, .webm",
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

import type { PresetStatusColorType } from "antd/es/_util/colors";
export const COURSE_TYPE = {
  OBLIGATORY: { value: 1, label: "Bắt buộc", color: "red" },
  OPTIONAL: { value: 2, label: "Không bắt buộc", color: "green" },
} as const;

export const COURSE_TYPE_LIST = Object.values(COURSE_TYPE);

export const COURSE_TYPE_KEY_BY = keyBy(COURSE_TYPE_LIST, "value");

export const COURSE_STATUS = {
  NEW: {
    value: 1,
    label: "Mới tạo",
    color: "blue" as PresetStatusColorType,
    nextSteps: [3] as readonly number[],
  },
  PUBLISH: {
    value: 2,
    label: "Đang phát hành",
    color: "green" as PresetStatusColorType,
    nextSteps: [3] as readonly number[],
  },
  PENDING: {
    value: 3,
    label: "Tạm ngưng",
    color: "orange" as PresetStatusColorType,
    nextSteps: [1, 2] as readonly number[],
  },
  END: {
    value: 4,
    label: "Đã kết thúc",
    color: "red" as PresetStatusColorType,
    nextSteps: [] as readonly number[],
  },
} as const;

export const COURSE_STATUS_LIST = Object.values(COURSE_STATUS);

export const COURSE_STATUS_KEY_BY = keyBy(COURSE_STATUS_LIST, "value");

export const getNextStatuses = (currentStatus: number): readonly number[] => {
  const statusConfig = COURSE_STATUS_KEY_BY[currentStatus];
  return statusConfig?.nextSteps || [];
};

export const COURSE_TOPIC = {
  NUTRITION: { value: 101, label: "Dinh dưỡng" },
  BUSINESS: { value: 102, label: "Kinh doanh" },
  SELL: { value: 103, label: "Bán hàng" },
  LEADER: { value: 104, label: "Lãnh đạo" },
};

export const COURSE_CATEGORIES = Object.values(COURSE_TOPIC).map((topic) => ({
  label: topic.label,
  value: topic.value,
}));

export const COURSE_TIME_STATE_TYPE = {
  CUSTOMIZE: { value: 1, label: "Tuỳ chỉnh", color: "blue" },
  ALL_TIME: { value: 2, label: "Vĩnh viễn", color: "green" },
};

export const COURSE_END_PRIZE = {
  BADGE: { value: 1, label: "Huy chương" },
  NONE: { value: 2, label: "Không" },
};

export const LEARN_ORDER = {
  YES: { value: true, label: "Bắt buộc" },
  NO: { value: false, label: "Không" },
};
