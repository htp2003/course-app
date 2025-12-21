import { useState, useEffect } from "react";
import { Form, message, notification } from "antd";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  createCourseAPI,
  updateCourseAPI,
  getCourseDetailAPI
} from "../services/api";
import { getErrorMessage } from "../../common/utils";
import type { ICreateCourseForm } from "../../common/types";
const DRAFT_KEY = "course_create_draft_v1";

export const useCourseForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm<ICreateCourseForm>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("id");
  const isEditMode = !!courseId;
  const { isFetching: isLoadingDetail } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseDetailAPI(courseId!),
    enabled: isEditMode,
    staleTime: 5000,
  });

  useEffect(() => {
    if (isEditMode && courseId) {
      getCourseDetailAPI(courseId).then((data) => {
        if (data) {
          form.setFieldsValue(data);
        }
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

  const saveSnapshot = (targetStep: number) => {
    if (isEditMode) return;
    const allData = form.getFieldsValue(true);
    const { thumbnail, ...safeData } = allData;
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        step: targetStep,
        data: safeData,
      })
    );
  };

  const next = async () => {
    try {
      let fieldsToValidate: string[] = [];
      if (currentStep === 0)
        fieldsToValidate = ["title", "price", "level", "category"];
      await form.validateFields(fieldsToValidate);
      const nextStep = currentStep + 1;
      saveSnapshot(nextStep);
      setCurrentStep(nextStep);
    } catch (error) {
      message.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
    }
  };

  const prev = () => {
    const prevStep = currentStep - 1;
    saveSnapshot(prevStep);
    setCurrentStep(prevStep);
  };

  const goTo = async (targetStep: number) => {
    if (targetStep < currentStep) {
      saveSnapshot(targetStep);
      setCurrentStep(targetStep);
    } else {
      try {
        await form.validateFields();
        saveSnapshot(targetStep);
        setCurrentStep(targetStep);
      } catch {
        message.error("Bạn phải hoàn thành bước hiện tại trước đã!");
      }
    }
  };

  const mutation = useMutation({
    mutationFn: (values: ICreateCourseForm) => {
      if (isEditMode && courseId) {
        return updateCourseAPI({ ...values, id: courseId });
      }
      return createCourseAPI(values);
    },
    onSuccess: () => {
      notification.success({
        message: "Thành công",
        description: isEditMode ? "Đã cập nhật khóa học!" : "Đã tạo khóa học mới!",
      });
      if (!isEditMode) {
        localStorage.removeItem(DRAFT_KEY);
      }
      form.resetFields();
      navigate("/course-management/list");
    },
    onError: (err: unknown) => {
      notification.error({ message: "Lỗi", description: getErrorMessage(err) });
    },
  });

  const onSubmit = async () => {
    try {
      const values = (await form.validateFields()) as ICreateCourseForm;
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
    isEditMode
  };
};