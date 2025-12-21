import { Steps, Button, Card, Form } from "antd";
import { useCourseForm } from "../hooks/use-course-form";
import {
  InfoCircleOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import { CourseInfoSection } from "./step-one/course-info-section";
import { StepTwoContent } from "./step-two/step-two-content";
import { StepThreeContent } from "./step-three/step-three-content";
import { StepFourContent } from "./step-four/step-four-content";

export const CourseWizard = () => {
  const { currentStep, next, prev, form, onSubmit, goTo, isSubmitting } = useCourseForm();

  const steps = [
    { title: "Thông tin chung", icon: <InfoCircleOutlined /> },
    { title: "Nội dung & Bài học", icon: <FileTextOutlined /> },
    { title: "Bài kiểm tra", icon: <QuestionCircleOutlined /> },
    { title: "Xem trước", icon: <EyeOutlined /> },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <Card className="mb-6 shadow-sm sticky top-4 z-50">
        <Steps
          current={currentStep}
          onChange={goTo}
          items={steps.map((s) => ({ title: s.title, icon: s.icon }))}
          className="course-steps"
        />
      </Card>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          level: 1,
          category: "it",
          price: 0,
          chapters: [],
        }}
      >
        <div className="min-h-[500px]">
          <div style={{ display: currentStep === 0 ? "block" : "none" }}>
            <CourseInfoSection />
          </div>

          <div style={{ display: currentStep === 1 ? "block" : "none" }}>
            <StepTwoContent />
          </div>

          <div style={{ display: currentStep === 2 ? "block" : "none" }}>
            <StepThreeContent />
          </div>

          <div style={{ display: currentStep === 3 ? "block" : "none" }}>
            <StepFourContent />
          </div>
        </div>
      </Form>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50 flex justify-end gap-3 max-w-6xl mx-auto rounded-t-lg ">
        {currentStep > 0 && (
          <Button onClick={prev} size="large" disabled={isSubmitting}>
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
            className="bg-green-600 hover:bg-green-500 border-green-600"
            onClick={onSubmit}
            loading={isSubmitting}
          >
            Hoàn tất
          </Button>
        )}
      </div>
    </div>
  );
};