import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button, Spin, Typography, FloatButton, Form } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";

import { getCourseDetailRealAPI } from "./services/api";
import { StepFourContent } from "../create/components/step-four/step-four-content";
import { mapCourseDetailToForm } from "./utils/detail-mapper";

import type { ICreateCourseForm } from "../common/types/types";

const { Title } = Typography;

export const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm<ICreateCourseForm>();

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["course-detail", id],
    queryFn: () => getCourseDetailRealAPI(id!),
    enabled: !!id,
    retry: false,
  });

  const apiData = response?.data;

  const previewData: ICreateCourseForm | undefined = useMemo(() => {
    if (!apiData) return undefined;
    return mapCourseDetailToForm(apiData);
  }, [apiData]);

  useEffect(() => {
    if (previewData) {
      form.setFieldsValue(previewData);
    }
  }, [form, previewData]);

  if (isLoading)
    return (
      <div className="h-screen flex justify-center items-center">
        <Spin size="large" />
      </div>
    );

  if (isError || !apiData) {
    const notFound = (error as any)?.response?.status === 404;
    return (
      <div className="p-10 text-center text-red-500">
        {notFound ? "Khoá học không tồn tại" : "Lỗi dữ liệu"}
        <div className="mt-4">
          <Button onClick={() => navigate("/course-management/list")}>
            Về danh sách
          </Button>
        </div>
      </div>
    );
  }

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

      <div className="mb-8 text-center">
        <Title level={3} className="text-gray-500 m-0 uppercase tracking-wide">
          Chi tiết khóa học
        </Title>
        <div className="text-gray-400 text-xs mt-1">ID: {id}</div>
      </div>

      <Form form={form} initialValues={previewData} layout="vertical">
        <StepFourContent isPreview />
      </Form>

      <FloatButton.BackTop />
    </div>
  );
};
