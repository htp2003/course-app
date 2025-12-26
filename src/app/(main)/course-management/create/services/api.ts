import apiClient from "../../../../../services/api-client";
import type { IUploadResponse } from "../../common/types/api-response";

const UPLOAD_BASE_URL = import.meta.env.VITE_UPLOAD_API_URL;
const CHUNK_SIZE = 5.5 * 1024 * 1024;

const extractData = (res: any) => {
  if (res?.uploadId) return res;
  if (res?.data?.uploadId) return res.data;
  if (res?.data?.data?.uploadId) return res.data.data;
  return res?.data || res;
};

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

export const uploadVideoChunkAPI = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ data: IUploadResponse }> => {
  const totalSize = file.size;
  let start = 0;
  let partNumber = 1;

  let uploadId = "";
  let key = "";
  let tagString = "";

  let finalResponse: { data: IUploadResponse } | null = null;

  while (start < totalSize) {
    const end = Math.min(start + CHUNK_SIZE, totalSize);
    const chunkBlob = file.slice(start, end);

    const isInit = partNumber === 1;
    const isLasted = end >= totalSize;

    const formData = new FormData();
    formData.append("fileName", file.name);
    formData.append("file", chunkBlob);
    formData.append("isInit", String(isInit));
    formData.append("isLasted", String(isLasted));
    formData.append("chunk", String(partNumber));

    if (!isInit) {
      if (!uploadId) throw new Error("Mất UploadID, dừng upload.");
      formData.append("uploadId", uploadId);
      formData.append("key", key);
      formData.append("tagString", tagString);
    }

    try {
      const res = await apiClient.post(`${UPLOAD_BASE_URL}/videos`, formData, {
        headers: { "Content-Type": undefined },
      });

      const responseData = extractData(res);

      if (responseData) {
        if (responseData.uploadId) uploadId = responseData.uploadId;
        if (responseData.key) key = responseData.key;
        if (responseData.tagString !== undefined) {
          tagString =
            typeof responseData.tagString === "object"
              ? JSON.stringify(responseData.tagString)
              : responseData.tagString;
        }
      } else {
        if (isInit) throw new Error("Server không trả về UploadID");
      }

      if (onProgress) {
        const percent = Math.round((end / totalSize) * 100);
        onProgress(percent);
      }

      if (isLasted) {
        finalResponse = { data: responseData || res };
      }

      start = end;
      partNumber++;
    } catch (error) {
      console.error(`Upload error at chunk ${partNumber}:`, error);
      throw error;
    }
  }

  if (!finalResponse) throw new Error("Upload failed.");
  return finalResponse;
};

export const createCourseAPI = (payload: unknown) =>
  apiClient.post("/herbalife-academy/course", payload);

export const updateCourseAPI = (payload: unknown) =>
  apiClient.put("/herbalife-academy/course", payload);

export const deleteCourseAPI = (id: string) =>
  apiClient.delete(`/herbalife-academy/course`, { params: { id } });
