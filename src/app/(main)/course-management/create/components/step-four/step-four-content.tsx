import { Form, Typography, Empty } from "antd";
import { CourseInfoSection } from "../step-one/course-info-section";
import { StepTwoContent } from "../step-two/step-two-content";
import { StepThreeContent } from "../step-three/step-three-content";
import type { ICreateCourseForm } from "../../../common/types/types";

interface Props {
  isPreview?: boolean;
}

export const StepFourContent = ({ isPreview = true }: Props) => {
  const form = Form.useFormInstance();
  const rawData = Form.useWatch([], form) as ICreateCourseForm;
  const stepTwoSentinelId = "step-two-end-sentinel";

  if (!rawData) {
    return <Empty description="Chưa có dữ liệu" />;
  }

  return (
    <div className="animate-fade-in pb-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Typography.Title level={3} className="text-gray-700 m-0">
            Xem trước khóa học
          </Typography.Title>
          <Typography.Text type="secondary">
            Kiểm tra toàn bộ thông tin và nội dung khóa học trước khi xuất bản
          </Typography.Text>
        </div>

        <CourseInfoSection isPreview={isPreview} />

        <div className="mt-10">
          <StepTwoContent
            isPreview={isPreview}
            sentinelId={stepTwoSentinelId}
          />
        </div>

        {isPreview && <div id={stepTwoSentinelId} className="h-1" />}

        <div className="mt-10">
          <StepThreeContent isPreview={isPreview} />
        </div>
      </div>
    </div>
  );
};
