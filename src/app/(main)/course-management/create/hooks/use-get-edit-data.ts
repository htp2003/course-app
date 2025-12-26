import { useQuery } from "@tanstack/react-query";
import type { UploadFile } from "antd/es/upload/interface";
import { getCourseDetailRealAPI } from "../../detail/services/api";
import { mapApiToUiForm } from "../../common/utils/mapper";

export const useGetEditData = (courseId: string | null) => {
  const isEditMode = !!courseId;

  return useQuery({
    queryKey: ["course-edit-data", courseId],
    queryFn: () => getCourseDetailRealAPI(courseId!),
    enabled: isEditMode,
    refetchOnWindowFocus: false,
    select: (response) => {
      const uiData = mapApiToUiForm(response.data);

      if (
        response.data.bannerUri &&
        (!uiData.thumbnail || uiData.thumbnail.length === 0)
      ) {
        uiData.thumbnail = [
          {
            uid: "-1",
            name: "banner.png",
            status: "done",
            url: response.data.bannerUri,
          },
        ] as UploadFile[];
      }
      return uiData;
    },
  });
};
