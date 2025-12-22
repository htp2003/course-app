import type { ICreateCourseForm } from "../../common/types";
const DB_KEY = "mock_db_courses";
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const getDB = (): any[] => {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : [];
};
const INITIAL_MOCK_DATA = [
  {
    id: "mock-1",
    title: "Khóa học ReactJS Mẫu (Demo)",
    category: "it",
    price: 500000,
    status: 2,
    level: 1,
    instructor: "Admin",
    createdAt: new Date().toISOString(),
    chapters: []
  }
];

export const getCourseListAPI = async () => {
  await delay(800);
  let dbData = getDB();
  if (dbData.length === 0) {
    dbData = INITIAL_MOCK_DATA;
    localStorage.setItem(DB_KEY, JSON.stringify(dbData));
  }
  return [...dbData].reverse();
};

export const getCourseDetailAPI = async (id: string): Promise<ICreateCourseForm | null> => {
  await delay(500);
  const db = getDB();
  const found = db.find((c: any) => c.id === id);
  return found || null;
};

export const createCourseAPI = async (payload: ICreateCourseForm): Promise<any> => {
  await delay(1500);
  const newCourse = {
    id: "course_" + Date.now(),
    createdAt: new Date().toISOString(),
    instructor: "Admin User",
    ...payload,
  };
  const currentDB = getDB();
  localStorage.setItem(DB_KEY, JSON.stringify([...currentDB, newCourse]));
  return { success: true, data: newCourse };
};

export const updateCourseAPI = async (payload: ICreateCourseForm & { id: string }) => {
  await delay(1000);
  const db = getDB();
  const index = db.findIndex((c: any) => c.id === payload.id);
  if (index !== -1) {
    db[index] = { ...db[index], ...payload };
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return { success: true };
  }
  throw new Error("Không tìm thấy khóa học để sửa");
};

export const deleteCourseAPI = async (id: string) => {
  await delay(800);
  const db = getDB();
  const newDb = db.filter((c: any) => c.id !== id);
  localStorage.setItem(DB_KEY, JSON.stringify(newDb));
  return { success: true };
};

export const uploadFileAPI = async (file: File): Promise<{ url: string; name: string }> => {
  await delay(1000);
  return {
    url: URL.createObjectURL(file),
    name: file.name,
  };
};