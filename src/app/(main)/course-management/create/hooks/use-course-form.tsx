import { useState, useEffect } from "react";
import { Form, message, notification } from "antd";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  createCourseAPI,
  updateCourseAPI,
  getCourseDetailAPI,
} from "../services/api";
import { getErrorMessage } from "../../common/utils";
import type { ICreateCourseForm } from "../../common/types";

const DRAFT_KEY = "course_create_draft_v1";

const STEP_REQUIRED_FIELDS: Record<number, (keyof ICreateCourseForm)[]> = {
  0: ["title", "price", "level", "category", "description"],
  1: ["chapters"],
  2: [],
  3: [],
};

export const useCourseForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm<ICreateCourseForm>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("id");
  const isEditMode = !!courseId;

  const [isStepValid, setIsStepValid] = useState(false);
  const watchedValues = Form.useWatch([], form);

  const { isFetching: isLoadingDetail } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseDetailAPI(courseId!),
    enabled: isEditMode,
    staleTime: 5000,
  });

  useEffect(() => {
    if (isEditMode && courseId) {
      getCourseDetailAPI(courseId).then((data) => {
        if (data) form.setFieldsValue(data);
      });
    }
  }, [isEditMode, courseId, form]);

  useEffect(() => {
    if (isEditMode) return;
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const { step, data } = JSON.parse(draft);
        form.setFieldsValue(data);
        setCurrentStep(step);
      } catch (e) {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, [form, isEditMode]);

  useEffect(() => {
    const checkValidity = () => {
      const { title, chapters } = watchedValues || {};
      if (currentStep === 0 && !title) setIsStepValid(false);
      else if (currentStep === 1 && (!chapters || chapters.length === 0))
        setIsStepValid(false);
      else setIsStepValid(true);
    };
    checkValidity();
  }, [watchedValues, currentStep]);

  const saveSnapshot = (targetStep: number) => {
    if (isEditMode) return;
    const allData = form.getFieldsValue(true);
    const { thumbnail, ...safeData } = allData;
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ step: targetStep, data: safeData })
    );
  };

  const handleStepChange = async (targetStep: number) => {
    try {
      if (targetStep > currentStep) {
        const fields = STEP_REQUIRED_FIELDS[currentStep] || [];

        if (fields.includes("chapters")) {
          const chapters = form.getFieldValue("chapters");
          if (!Array.isArray(chapters) || chapters.length === 0) {
            message.error("Vui lòng thêm ít nhất một chương và bài học!");
            throw new Error("Chapters required");
          }
        }

        const normalFields = fields.filter((f) => f !== "chapters");
        if (normalFields.length > 0) {
          await form.validateFields(normalFields);
        }
      }

      saveSnapshot(targetStep);
      setCurrentStep(targetStep);
    } catch (error: any) {
      if (error.message === "Chapters required") return;

      if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
        form.scrollToField(error.errorFields[0].name);
      }
    }
  };

  const next = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields([
          "title",
          "price",
          "level",
          "category",
          "description",
        ]);
      } else {
        await form.validateFields();

        if (currentStep === 1) {
          const chapters = form.getFieldValue("chapters");
          if (!chapters || chapters.length === 0) {
            message.error("Vui lòng tạo ít nhất một chương nội dung!");
            return;
          }
        }
      }

      const nextStep = currentStep + 1;
      saveSnapshot(nextStep);
      setCurrentStep(nextStep);
    } catch (error) {
      console.error("Validation failed:", error);
      message.error("Vui lòng điền đầy đủ các trường báo đỏ!");
    }
  };
  const prev = () => handleStepChange(currentStep - 1);
  const goTo = async (targetStep: number) => {
    if (targetStep < currentStep) {
      saveSnapshot(targetStep);
      setCurrentStep(targetStep);
      return;
    }

    try {
      if (currentStep === 0) {
        await form.validateFields([
          "title",
          "price",
          "level",
          "category",
          "description",
        ]);
      } else {
        await form.validateFields();

        if (currentStep === 1) {
          const chapters = form.getFieldValue("chapters");
          if (!chapters || chapters.length === 0) {
            message.error("Vui lòng tạo ít nhất một chương nội dung!");
            return;
          }
        }
      }

      saveSnapshot(targetStep);
      setCurrentStep(targetStep);
    } catch (error) {
      message.error("Vui lòng hoàn thành bước hiện tại trước khi chuyển tiếp!");
    }
  };

  const mutation = useMutation({
    mutationFn: (values: ICreateCourseForm) => {
      if (isEditMode && courseId)
        return updateCourseAPI({ ...values, id: courseId });
      return createCourseAPI(values);
    },
    onSuccess: () => {
      notification.success({
        message: "Thành công",
        description: isEditMode
          ? "Đã cập nhật khóa học!"
          : "Đã tạo khóa học mới!",
      });
      if (!isEditMode) localStorage.removeItem(DRAFT_KEY);
      form.resetFields();
      navigate("/course-management/list");
    },
    onError: (err: unknown) => {
      notification.error({ message: "Lỗi", description: getErrorMessage(err) });
    },
  });

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      mutation.mutate({ ...values, status: values.status ?? 0 });
    } catch (e) {
      message.error("Vui lòng kiểm tra lại toàn bộ form");
    }
  };

  return {
    currentStep,
    form,
    next,
    prev,
    goTo,
    onSubmit,
    isSubmitting: mutation.isPending || isLoadingDetail,
    isStepValid,
  };
};
