import apiClient from "../../../../../services/api-client";
import type { IUploadResponse } from "../../common/types/api-response";

const UPLOAD_BASE_URL = import.meta.env.VITE_UPLOAD_API_URL;
const CHUNK_SIZE = 5.5 * 1024 * 1024;

type ExtractedResponse = Record<string, unknown>;

const extractData = (res: unknown): ExtractedResponse => {
  const resObj = res as Record<string, unknown>;
  if (resObj?.uploadId) return resObj;
  if (resObj?.data && typeof resObj.data === "object") {
    const data = resObj.data as Record<string, unknown>;
    if (data.uploadId) return data;
    if (data.data) return data.data as ExtractedResponse;
  }
  return resObj?.data ? (resObj.data as ExtractedResponse) : resObj;
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
        const uploadIdVal = responseData.uploadId as string | undefined;
        const keyVal = responseData.key as string | undefined;
        const tagStringVal = responseData.tagString;

        if (uploadIdVal) uploadId = uploadIdVal;
        if (keyVal) key = keyVal;
        if (tagStringVal !== undefined) {
          tagString =
            typeof tagStringVal === "object"
              ? JSON.stringify(tagStringVal)
              : String(tagStringVal);
        }
      } else {
        if (isInit) throw new Error("Server không trả về UploadID");
      }

      if (onProgress) {
        const percent = Math.round((end / totalSize) * 100);
        onProgress(percent);
      }

      if (isLasted) {
        finalResponse = { data: (responseData || res) as IUploadResponse };
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

export const deleteCourseAPI = (id: string) =>
  apiClient.delete(`/herbalife-academy/course`, { params: { id } });
