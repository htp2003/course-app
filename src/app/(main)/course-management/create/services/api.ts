import type { ICreateCourseForm } from "../../common/types";

export const MOCK_COURSE_DATA: ICreateCourseForm = {
  title: "ReactJS Ultimate: Từ Zero đến Hero 2025",
  price: 1299000,
  level: 2,
  category: "it",
  description:
    "Khóa học ReactJS toàn diện nhất, bao gồm Hooks, Redux Toolkit, React Query và Next.js.",
  status: 0,

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
        },
        {
          id: "les_1_2",
          title: "Cài đặt Node.js và VS Code",
          type: "document",
          duration: 15,
          content: "<h1>Hướng dẫn cài đặt</h1><p>Bước 1: Tải Node.js...</p>",
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
          type: "document",
          duration: 15,
          content: "Code mẫu custom hook...",
        },
      ],
    },
  ],
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const createCourseAPI = async (
  payload: ICreateCourseForm
): Promise<{
  success: boolean;
  data: ICreateCourseForm & { id: string; createdAt: string };
}> => {
  await delay(1500);

  return {
    success: true,
    data: {
      id: "new_course_" + Date.now(),
      createdAt: new Date().toISOString(),
      ...payload,
    },
  };
};

export const uploadFileAPI = async (
  file: File
): Promise<{ url: string; name: string }> => {
  await delay(1000);

  return {
    url: URL.createObjectURL(file),
    name: file.name,
  };
};

export const getCourseDetailAPI = async (
  _id: string
): Promise<ICreateCourseForm> => {
  await delay(500);
  return MOCK_COURSE_DATA;
};
