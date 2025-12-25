import type { TCourseDetailResponse } from "../../common/types/api-response";
import apiClient from "../../../../../services/api-client";

export const getCourseDetailRealAPI = (
  id: string
): Promise<TCourseDetailResponse> => {
  return apiClient.get(`/herbalife-academy/course/${id}`);
};
