import { Steps, Button, Card, Form, Grid } from "antd";
import { useCourseForm } from "../hooks/use-course-form";
import {
  InfoCircleOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { CourseInfoSection } from "./step-one/course-info-section";
import { StepTwoContent } from "./step-two/step-two-content";
import { StepThreeContent } from "./step-three/step-three-content";
import { StepFourContent } from "./step-four/step-four-content";

const { useBreakpoint } = Grid;

export const CourseWizard = () => {
  const {
    currentStep,
    maxStep,
    next,
    prev,
    form,
    onSubmit,
    goTo,
    isSubmitting,
  } = useCourseForm();

  const screens = useBreakpoint();
  const steps = [
    { title: "Thông tin chung", icon: <InfoCircleOutlined /> },
    { title: "Nội dung & Bài học", icon: <FileTextOutlined /> },
    { title: "Bài kiểm tra", icon: <QuestionCircleOutlined /> },
    { title: "Xem trước", icon: <EyeOutlined /> },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <Card className="mb-6 shadow-sm sticky top-4 z-40">
        <Steps
          current={currentStep}
          onChange={goTo}
          direction={screens.lg ? "horizontal" : "vertical"}
          items={steps.map((s, index) => {
            const isDisabled = index > maxStep && index > currentStep + 1;
            return {
              title: s.title,
              icon: s.icon,
              disabled: isDisabled,
            };
          })}
          className="course-steps"
        />
      </Card>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          chapters: [],
        }}
      >
        <div className="min-h-[500px]">
          <div
            style={{ display: currentStep === 0 ? "block" : "none" }}
            className="animate-fade-in"
          >
            <CourseInfoSection />
          </div>

          <div
            style={{ display: currentStep === 1 ? "block" : "none" }}
            className="animate-fade-in"
          >
            <StepTwoContent />
          </div>

          <div
            style={{ display: currentStep === 2 ? "block" : "none" }}
            className="animate-fade-in"
          >
            <StepThreeContent />
          </div>

          {currentStep === 3 && (
            <div className="animate-fade-in">
              <StepFourContent />
            </div>
          )}
        </div>
      </Form>

      <div className="fixed bottom-4 md:bottom-8 right-4 md:right-8 z-50 flex flex-col gap-2">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 bg-white p-2 md:p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100">
          {currentStep > 0 && (
            <Button
              onClick={prev}
              size="large"
              disabled={isSubmitting}
              icon={<ArrowLeftOutlined />}
              className="rounded-xl border-none bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium w-full md:w-auto"
            >
              <span className="hidden md:inline">Quay lại</span>
            </Button>
          )}

          {currentStep < steps.length - 1 && (
            <Button
              type="primary"
              onClick={next}
              size="large"
              icon={<ArrowRightOutlined />}
              iconPosition="end"
              className="rounded-xl shadow-md font-medium w-full md:w-auto px-3 md:px-6"
            >
              <span className="hidden md:inline">Tiếp tục</span>
            </Button>
          )}

          {currentStep === steps.length - 1 && (
            <Button
              type="primary"
              size="large"
              icon={<CheckOutlined />}
              className="bg-green-600 hover:bg-green-500 border-green-600 rounded-xl shadow-green-200 shadow-lg font-bold w-full md:w-auto px-3 md:px-6"
              onClick={onSubmit}
              loading={isSubmitting}
            >
              <span className="hidden md:inline">Hoàn tất khóa học</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
