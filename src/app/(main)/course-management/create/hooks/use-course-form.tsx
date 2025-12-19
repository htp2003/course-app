import { useState, useEffect } from "react";
import { Form, message, notification } from "antd";
import { useMutation } from "@tanstack/react-query";
import { createCourseAPI } from "../services/api";
import { getErrorMessage } from "../../common/utils";
import type { ICreateCourseForm } from "../../common/types";

const DRAFT_KEY = "course_create_draft_v1";

export const useCourseForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm<ICreateCourseForm>();

  useEffect(() => {
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
  }, [form]);

  const saveSnapshot = (targetStep: number) => {
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
    mutationFn: createCourseAPI,
    onSuccess: () => {
      notification.success({
        message: "Thành công",
        description: "Đã tạo khóa học!",
      });
      localStorage.removeItem(DRAFT_KEY);
      form.resetFields();
      setCurrentStep(0);
    },
    onError: (err: unknown) => {
      notification.error({ message: "Lỗi", description: getErrorMessage(err) });
    },
  });

  const onSubmit = async () => {
    try {
      const values = (await form.validateFields()) as ICreateCourseForm;
      mutation.mutate({ ...values, status: 0 });
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
    isSubmitting: mutation.isPending,
  };
};
