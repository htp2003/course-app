import { useQuery } from "@tanstack/react-query";
import { getCourseDetailRealAPI } from "../services/api";
import { mapApiToUiForm } from "../../common/utils/mapper";

export const useCourseDetail = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ["course-detail-view", courseId],
    queryFn: () => getCourseDetailRealAPI(courseId!),
    enabled: !!courseId,
    select: (response) => mapApiToUiForm(response.data),
    retry: 1,
  });
};
