import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Spin,
  Typography,
  FloatButton,
  Form,
  Modal,
  Radio,
  Tag,
  Space,
} from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";

import { getCourseDetailRealAPI } from "./services/api";
import { StepFourContent } from "../create/components/step-four/step-four-content";
import { mapCourseDetailToForm } from "./utils/detail-mapper";
import { useUpdateCourseStatus } from "./hooks/use-update-course-status";
import {
  COURSE_STATUS_KEY_BY,
  getNextStatuses,
} from "../common/constants/constants";

import type { ICreateCourseForm } from "../common/types/types";

const { Title } = Typography;

export const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm<ICreateCourseForm>();
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<number | undefined>();

  const courseId = id ? Number(id) : 0;

  const handleCloseModal = () => {
    setIsStatusModalOpen(false);
    setSelectedStatus(undefined);
  };

  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateCourseStatus(courseId, handleCloseModal);

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["course-detail", courseId],
    queryFn: () => getCourseDetailRealAPI(courseId),
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
        {notFound
          ? "Khoá học không tồn tại"
          : "Lỗi dữ liệu, vui lòng kiểm tra lại."}
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
        <div className="flex items-center gap-4">
          {apiData?.status && (
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Trạng thái:</span>
              <Tag
                color={COURSE_STATUS_KEY_BY[apiData.status]?.color || "default"}
              >
                {COURSE_STATUS_KEY_BY[apiData.status]?.label || apiData.status}
              </Tag>
            </div>
          )}
          {apiData?.status && getNextStatuses(apiData.status).length > 0 && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setIsStatusModalOpen(true)}
            >
              Chỉnh sửa
            </Button>
          )}
        </div>
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

      <Modal
        title="Chuyển đổi trạng thái khóa học"
        open={isStatusModalOpen}
        onCancel={handleCloseModal}
        onOk={() => {
          if (selectedStatus !== undefined) {
            updateStatus(selectedStatus);
          }
        }}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={isUpdatingStatus}
        okButtonProps={{ disabled: selectedStatus === undefined }}
        maskClosable={!isUpdatingStatus}
        closable={!isUpdatingStatus}
      >
        <div className="py-4">
          <p className="mb-4 text-gray-600">
            Chọn trạng thái mới cho khóa học:
          </p>
          <Radio.Group
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full"
            disabled={isUpdatingStatus}
          >
            <Space direction="vertical" className="w-full">
              {apiData?.status &&
                getNextStatuses(apiData.status).map((statusValue: number) => {
                  const statusConfig = COURSE_STATUS_KEY_BY[statusValue];
                  if (!statusConfig) return null;
                  return (
                    <Radio key={statusValue} value={statusValue}>
                      <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
                    </Radio>
                  );
                })}
            </Space>
          </Radio.Group>
        </div>
      </Modal>
    </div>
  );
};
