import { useQuery } from "@tanstack/react-query";
import { getCourseDetailRealAPI } from "../services/api"; // Import từ local service
import { mapApiToUiForm } from "../../common/utils/mapper"; // Mapper dùng chung thì OK

export const useCourseDetail = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ["course-detail-view", courseId], // Key khác với trang edit để tránh conflict cache
    queryFn: () => getCourseDetailRealAPI(courseId!),
    enabled: !!courseId,
    select: (data) => mapApiToUiForm(data),
    retry: 1,
  });
};
