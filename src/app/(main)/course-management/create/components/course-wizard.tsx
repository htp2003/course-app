// src/app/(main)/course-management/create/components/course-wizard.tsx
import { Steps, Button, Card, theme, Form } from "antd";
import { useCourseForm } from "../hooks/use-course-form";
import {
  InfoCircleOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";

// Import các component con (Placeholder tạm)
import { StepOneInfo } from "./step-one-info";
import { StepTwoContent } from "./step-two-content";
import { StepThreeQuiz } from "./step-three-quiz";
import { StepFourPreview } from "./step-four-preview";

export const CourseWizard = () => {
  const { token } = theme.useToken();
  const { currentStep, next, prev, form, onSubmit, goTo, isSubmitting } =
    useCourseForm();

  // Cấu hình các bước
  const steps = [
    {
      title: "Thông tin chung",
      icon: <InfoCircleOutlined />,
      content: <StepOneInfo />,
    },
    {
      title: "Nội dung & Bài học",
      icon: <FileTextOutlined />,
      content: <StepTwoContent />,
    },
    {
      title: "Bài kiểm tra",
      icon: <QuestionCircleOutlined />,
      content: <StepThreeQuiz />,
    },
    {
      title: "Xem trước",
      icon: <EyeOutlined />,
      content: <StepFourPreview />,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Thanh tiến trình */}
      <Card className="mb-6 shadow-sm">
        <Steps
          current={currentStep}
          onChange={goTo}
          items={steps.map((s) => ({ title: s.title, icon: s.icon }))}
        />
      </Card>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          level: "beginner",
          chapters: [], // Khởi tạo mảng chương rỗng
        }}
        preserve={true}
      >
        <div className="mb-6 min-h-[400px]">
          {/* Render nội dung bước hiện tại */}
          {/* Lưu ý: Các file StepOne, StepTwo... giờ sẽ chứa <Form.Item> */}
          {steps[currentStep].content}
        </div>
      </Form>

      <div className="flex justify-end gap-3 pb-8">
        {currentStep > 0 && (
          <Button onClick={prev} size="large">
            Quay lại
          </Button>
        )}

        {currentStep < steps.length - 1 && (
          <Button type="primary" onClick={next} size="large">
            Tiếp tục
          </Button>
        )}

        {currentStep === steps.length - 1 && (
          <Button
            type="primary"
            size="large"
            className="bg-green-600 hover:bg-green-500"
            onClick={onSubmit} // Gọi hàm submit cuối cùng
          >
            Hoàn tất tạo khóa học
          </Button>
        )}
      </div>
    </div>
  );
};
