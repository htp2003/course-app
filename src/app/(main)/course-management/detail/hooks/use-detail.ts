import { useQuery } from "@tanstack/react-query";
import { getCourseDetailRealAPI } from "../services/api";
import { mapApiToUiForm } from "../../common/utils/mapper";

export const useCourseDetail = (courseId: string | undefined) => {
  const parsedId = courseId ? Number(courseId) : 0;

  return useQuery({
    queryKey: ["course-detail-view", parsedId],
    queryFn: () => getCourseDetailRealAPI(parsedId),
    enabled: !!courseId && !isNaN(parsedId),
    select: (response) => mapApiToUiForm(response.data),
    retry: 1,
  });
};
