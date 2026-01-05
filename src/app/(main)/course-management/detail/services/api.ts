import type { TCourseDetailResponse } from "../../common/types/api-response";
import apiClient from "../../../../../services/api-client";

export const getCourseDetailRealAPI = (
  id: number
): Promise<TCourseDetailResponse> => {
  return apiClient.get(`/herbalife-academy/course/${id}`);
};

export const patchCourseStatus = (
  courseId: number,
  status: number
): Promise<TCourseDetailResponse> => {
  return apiClient.patch(`/herbalife-academy/course/${courseId}`, { status });
};
