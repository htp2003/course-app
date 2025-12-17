import type { TCreateCourseForm } from "../types";

export const MOCK_COURSE_DATA: TCreateCourseForm = {
  // --- BƯỚC 1: INFO ---
  title: "ReactJS Ultimate: Từ Zero đến Hero 2025",
  price: 1299000,
  level: "intermediate",
  // category: "it",
  description:
    "Khóa học ReactJS toàn diện nhất, bao gồm Hooks, Redux Toolkit, React Query và Next.js.",
  status: "draft",

  // --- BƯỚC 2: CONTENT (QUAN TRỌNG NHẤT) ---
  chapters: [
    {
      id: "chap_1",
      title: "Giới thiệu & Cài đặt môi trường",
      lessons: [
        {
          id: "les_1_1",
          title: "ReactJS là gì? Tại sao nên học?",
          type: "video",
          duration: 10,
          videoUrl: "https://youtu.be/video_id_1",
          isFree: true,
        },
        {
          id: "les_1_2",
          title: "Cài đặt Node.js và VS Code",
          type: "text",
          duration: 15,
          content: "<h1>Hướng dẫn cài đặt</h1><p>Bước 1: Tải Node.js...</p>",
          references: "https://nodejs.org",
        },
      ],
    },
    {
      id: "chap_2",
      title: "Kiến thức cốt lõi (Core Concepts)",
      lessons: [
        {
          id: "les_2_1",
          title: "JSX là gì?",
          type: "video",
          duration: 20,
          videoUrl: "https://youtu.be/video_id_2",
        },
        {
          id: "les_2_2",
          title: "Components & Props",
          type: "video",
          duration: 25,
          videoUrl: "https://youtu.be/video_id_3",
        },
        {
          id: "les_2_3",
          title: "State & Lifecycle",
          type: "video",
          duration: 30,
          videoUrl: "https://youtu.be/video_id_4",
        },
        {
          id: "les_2_4",
          title: "Bài tập thực hành: Todo List",
          type: "quiz",
          duration: 45,
          // content: 'quiz_id_123' (Link tới bài quiz)
        },
      ],
    },
    {
      id: "chap_3",
      title: "Hooks nâng cao",
      lessons: [
        {
          id: "les_3_1",
          title: "useEffect & useLayoutEffect",
          type: "video",
          duration: 20,
          videoUrl: "...",
        },
        {
          id: "les_3_2",
          title: "useMemo & useCallback",
          type: "video",
          duration: 25,
          videoUrl: "...",
        },
        {
          id: "les_3_3",
          title: "Custom Hooks",
          type: "text",
          duration: 15,
          content: "Code mẫu custom hook...",
        },
      ],
    },
  ],

  // --- BƯỚC 3: QUIZ (Tạm) ---
  // quizId: "quiz_final_01",
};

// =============================================================================
// 2. MOCK API FUNCTIONS (API ẢO)
// =============================================================================

// Giả lập độ trễ mạng (Network Latency)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * API Tạo khóa học mới
 */
export const createCourseAPI = async (payload: TCreateCourseForm) => {
  await delay(1500); // Giả lập chờ 1.5s

  // Giả lập server trả về
  return {
    success: true,
    data: {
      id: "new_course_" + Date.now(),
      createdAt: new Date().toISOString(),
      ...payload,
    },
  };
};

/**
 * API Upload File (Ảnh, Video, Tài liệu)
 * Trả về link file giả
 */
export const uploadFileAPI = async (file: File) => {
  await delay(1000);

  return {
    url: URL.createObjectURL(file), // Tạo blob url để preview được ngay trên trình duyệt
    name: file.name,
  };
};

/**
 * API Lấy chi tiết khóa học (Dùng cho trang Edit hoặc Test Load Data)
 */
export const getCourseDetailAPI = async (_id: string) => {
  await delay(500);
  return MOCK_COURSE_DATA;
};
