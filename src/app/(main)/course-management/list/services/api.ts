import apiClient from "../../../../../services/api-client";
import type { TGetCoursesParams, TGetCoursesResponse } from "../types";

export const courseListAPI = {
  getCourses: (params: TGetCoursesParams): Promise<TGetCoursesResponse> => {
    return apiClient.get("/herbalife-academy/course", {
      params: params,
    });
  },
};
