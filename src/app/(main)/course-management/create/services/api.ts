import apiClient from "../../../../../services/api-client";
import type { IUploadResponse } from "../../common/types/api-response";

const UPLOAD_BASE_URL = import.meta.env.VITE_UPLOAD_API_URL;


export const uploadImageAPI = (
  file: File
): Promise<{ data: IUploadResponse }> => {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient.post(`${UPLOAD_BASE_URL}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const uploadDocumentAPI = (
  file: File
): Promise<{ data: IUploadResponse }> => {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient.post(`${UPLOAD_BASE_URL}/files`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const createCourseAPI = (payload: unknown) => {
  return apiClient.post("/herbalife-academy/course", payload);
};

export const updateCourseAPI = (payload: unknown) => {
  return apiClient.put("/herbalife-academy/course", payload);
};

export const deleteCourseAPI = (id: string) => {
  return apiClient.delete(`/herbalife-academy/course`, { params: { id } });
};
