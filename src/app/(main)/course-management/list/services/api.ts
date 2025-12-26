import apiClient from "../../../../../services/api-client";
import type { TGetCoursesParams, TGetCoursesResponse } from "../types";

export const courseListAPI = {
  getCourses: (params: TGetCoursesParams): Promise<TGetCoursesResponse> => {
    return apiClient.get("/herbalife-academy/course", {
      params: params,
      paramsSerializer: (params) => {
        const searchParams = new URLSearchParams();

        Object.keys(params).forEach((key) => {
          const value = params[key as keyof TGetCoursesParams];

          if (Array.isArray(value)) {
            value.forEach((item) => searchParams.append(key, String(item)));
          } else if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
          }
        });

        return searchParams.toString();
      },
    });
  },
};
