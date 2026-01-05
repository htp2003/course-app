import { Steps, Button, Card, Form, Grid, Alert, Spin } from "antd";
import { useCourseForm } from "../hooks/use-course-form";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
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
import { lazy, Suspense } from "react";

const StepTwoContent = lazy(() =>
  import("./step-two/step-two-content").then((module) => ({
    default: module.StepTwoContent,
  }))
);

const StepThreeContent = lazy(() =>
  import("./step-three/step-three-content").then((module) => ({
    default: module.StepThreeContent,
  }))
);

const StepFourContent = lazy(() =>
  import("./step-four/step-four-content").then((module) => ({
    default: module.StepFourContent,
  }))
);

const { useBreakpoint } = Grid;

export const CourseWizard = () => {
  const location = useLocation();
  const {
    currentStep,
    maxStep,
    next,
    prev,
    form,
    onSubmit,
    goTo,
    isSubmitting,
    hasValidationError,
    setHasValidationError,
    handleFieldsChange,
    isFormDirty,
  } = useCourseForm();

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isFormDirty && !isSubmitting) {
        e.preventDefault();
        const confirmed = window.confirm(
          "Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời khỏi trang?"
        );
        if (!confirmed) {
          window.history.pushState(null, "", location.pathname);
        }
      }
    };

    window.history.pushState(null, "", location.pathname);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isFormDirty, isSubmitting, location.pathname]);

  const screens = useBreakpoint();
  const steps = [
    { title: "Thông tin chung", icon: <InfoCircleOutlined /> },
    { title: "Nội dung & Bài học", icon: <FileTextOutlined /> },
    { title: "Bài kiểm tra", icon: <QuestionCircleOutlined /> },
    { title: "Xem trước", icon: <EyeOutlined /> },
  ];

  const StepFallback = ({ label }: { label: string }) => (
    <div className="flex justify-center items-center h-[420px]">
      <Spin tip={`Đang tải ${label.toLowerCase()}...`} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <Card className="mb-6 shadow-sm top-4 ">
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
        onFieldsChange={() => {
          handleFieldsChange();
          const hasError = form
            .getFieldsError()
            .some(({ errors }) => errors.length > 0);
          setHasValidationError(hasError);
        }}
      >
        {hasValidationError && (
          <div className="mb-4">
            <Alert
              type="error"
              showIcon
              message="Bạn còn trường bắt buộc chưa điền. Vui lòng kiểm tra lại."
            />
          </div>
        )}
        <div className="min-h-[500px]">
          <div
            style={{ display: currentStep === 0 ? "block" : "none" }}
            className="animate-fade-in"
          >
            <CourseInfoSection />
          </div>

          <Suspense fallback={<StepFallback label="Nội dung & bài học" />}>
            <div
              style={{ display: currentStep === 1 ? "block" : "none" }}
              className="animate-fade-in"
            >
              <StepTwoContent />
            </div>
          </Suspense>

          <Suspense fallback={<StepFallback label="Bài kiểm tra" />}>
            <div
              style={{ display: currentStep === 2 ? "block" : "none" }}
              className="animate-fade-in"
            >
              <StepThreeContent />
            </div>
          </Suspense>

          {currentStep === 3 && (
            <Suspense fallback={<StepFallback label="Xem trước" />}>
              <div className="animate-fade-in">
                <StepFourContent />
              </div>
            </Suspense>
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
              disabled={isSubmitting}
            >
              <span className="hidden md:inline">Hoàn tất khóa học</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
