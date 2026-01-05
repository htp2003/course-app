import { App } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchCourseStatus } from "../services/api";
import type { TCourseDetailResponse } from "../../common/types/api-response";

export const useUpdateCourseStatus = (
  courseId: number,
  onSuccessCallback?: () => void
) => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: number) => patchCourseStatus(courseId, status),
    onSuccess: (data: TCourseDetailResponse) => {
      if (!data?.data) {
        message.error("Dữ liệu phản hồi không hợp lệ");
        return;
      }

      queryClient.setQueryData(["course-detail", courseId], data);
      queryClient.invalidateQueries({ queryKey: ["courses"] });

      message.success("Cập nhật trạng thái thành công!");

      onSuccessCallback?.();
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      const errorMessage =
        status === 400
          ? "Trạng thái không hợp lệ hoặc không được phép chuyển đổi"
          : "Cập nhật trạng thái thất bại";
      message.error(errorMessage);
    },
  });
};
