import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button, Spin, Typography, App } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";

import { getCourseDetailRealAPI } from "../detail/services/api";
import { mapApiToUiForm } from "../common/utils/mapper";
import { CourseContentPreview } from "../components/course-content-preview";
import type { ICreateCourseForm } from "../common/types/types";

const { Title } = Typography;

export const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [previewData, setPreviewData] = useState<ICreateCourseForm | null>(
    null
  );

  const {
    data: apiResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["course-detail", id],
    queryFn: () => getCourseDetailRealAPI(id!),
    enabled: !!id,
    retry: 1,
  });

  useEffect(() => {
    if (apiResponse) {
      try {
        const realData =
          (apiResponse as any).result ||
          (apiResponse as any).data ||
          apiResponse;

        if (!realData || !realData.id) {
          return;
        }

        const mappedData = mapApiToUiForm(realData);

        if (realData.bannerUri && !mappedData.thumbnail?.length) {
          mappedData.thumbnail = [
            {
              uid: "-1",
              name: "banner",
              status: "done",
              url: realData.bannerUri,
            },
          ] as any;
        }

        setPreviewData(mappedData);
      } catch (error) {
        console.error(error);
        message.error("Lỗi khi xử lý dữ liệu");
      }
    }
  }, [apiResponse, message]);

  if (isLoading)
    return (
      <div className="h-screen flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  if (isError)
    return <div className="p-10 text-center text-red-500">Lỗi tải dữ liệu</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in pb-20">
      <div className="flex justify-between items-center mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/course-management/list")}
        >
          Quay lại danh sách
        </Button>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/course-management/create?id=${id}`)}
        >
          Chỉnh sửa
        </Button>
      </div>

      <div className="mb-6 text-center">
        <Title level={2} className="text-indigo-800 m-0">
          CHI TIẾT KHÓA HỌC
        </Title>
        <div className="text-gray-400 text-xs mt-1">ID: {id}</div>
      </div>

      {previewData ? (
        <CourseContentPreview data={previewData} />
      ) : (
        <div className="text-center text-gray-400">
          Không có dữ liệu hiển thị
        </div>
      )}
    </div>
  );
};
