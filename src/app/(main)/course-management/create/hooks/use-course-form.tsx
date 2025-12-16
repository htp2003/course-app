// src/app/(main)/course-management/create/hooks/use-course-form.tsx
import { useState, useEffect } from "react";
import { Form, message, notification } from "antd";
import { useMutation } from "@tanstack/react-query";
import { createCourseAPI } from "../services/api";
import type { TCreateCourseForm } from "../types";

const DRAFT_KEY = "course_create_draft_v1";

export const useCourseForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm<TCreateCourseForm>();

  // --- 1. LOAD DATA KHI F5 ---
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const { step, data } = JSON.parse(draft);
        // Load lại toàn bộ data vào form
        form.setFieldsValue(data);
        setCurrentStep(step);
        // message.info('Đã khôi phục dữ liệu cũ');
      } catch (e) {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, [form]);

  // --- HELPER: LƯU LOCALSTORAGE ---
  // Hàm này lưu TẤT CẢ data hiện có trong form + step đích đến
  const saveSnapshot = (targetStep: number) => {
    // Lấy toàn bộ value, kể cả field đang bị ẩn (nhờ preserve=true bên UI)
    const allData = form.getFieldsValue(true);

    // Lọc bỏ file object (thumbnail) để tránh lỗi crash storage
    const { thumbnail, ...safeData } = allData;

    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        step: targetStep,
        data: safeData,
      })
    );
  };

  // --- 2. LOGIC NAVIGATION (STRICT MODE) ---

  // Bấm nút "Tiếp tục"
  const next = async () => {
    try {
      // 1. Validate bước hiện tại thật chặt
      // Bạn cần định nghĩa các field của từng bước vào đây để validate cục bộ
      let fieldsToValidate: string[] = [];

      if (currentStep === 0) fieldsToValidate = ["title", "price", "level"];
      // if (currentStep === 1) fieldsToValidate = ['chapters'];

      await form.validateFields(fieldsToValidate);

      // 2. Nếu Ok thì mới Lưu & Chuyển bước
      const nextStep = currentStep + 1;
      saveSnapshot(nextStep);
      setCurrentStep(nextStep);
    } catch (error) {
      message.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
    }
  };

  // Bấm nút "Quay lại" (Thường ko cần validate, nhưng vẫn phải lưu data hiện tại)
  const prev = () => {
    const prevStep = currentStep - 1;
    saveSnapshot(prevStep);
    setCurrentStep(prevStep);
  };

  // Bấm vào thanh Steps (Nhảy cóc)
  const goTo = async (targetStep: number) => {
    // Chỉ cho phép nhảy nếu targetStep nhỏ hơn currentStep (quay lại)
    // HOẶC nếu muốn nhảy đi tiếp thì phải validate bước hiện tại trước
    if (targetStep < currentStep) {
      saveSnapshot(targetStep);
      setCurrentStep(targetStep);
    } else {
      // Muốn nhảy tới? Check valid bước hiện tại đã
      try {
        await form.validateFields(); // Validate all hoặc define field cụ thể
        saveSnapshot(targetStep);
        setCurrentStep(targetStep);
      } catch {
        message.error("Bạn phải hoàn thành bước hiện tại trước đã!");
      }
    }
  };

  // --- 3. SUBMIT ---
  const mutation = useMutation({
    mutationFn: createCourseAPI,
    onSuccess: () => {
      notification.success({
        message: "Thành công",
        description: "Đã tạo khóa học!",
      });
      localStorage.removeItem(DRAFT_KEY); // Xóa draft
      form.resetFields();
      setCurrentStep(0);
    },
    onError: (err: any) =>
      notification.error({ message: "Lỗi", description: err.message }),
  });

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      mutation.mutate({ ...values, status: "draft" });
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
