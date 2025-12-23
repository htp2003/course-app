import { useState, useEffect } from "react";
import { Form, App, notification } from "antd";
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

export const useCourseForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm<ICreateCourseForm>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("id");
  const isEditMode = !!courseId;
  const { message } = App.useApp();

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

  const saveSnapshot = (targetStep: number) => {
    if (isEditMode) return;
    const allData = form.getFieldsValue(true);
    const { thumbnail, ...safeData } = allData;
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ step: targetStep, data: safeData })
    );
  };

  const getFieldsToValidate = (): any[] => {
    if (currentStep === 0) {
      return ["title", "price", "level", "category", "description"];
    }

    const chapters = form.getFieldValue("chapters") || [];
    const paths: any[] = [];

    if (currentStep === 1) {
      paths.push("chapters");

      chapters.forEach((chap: any, cIdx: number) => {
        paths.push(["chapters", cIdx, "title"]);

        if (chap.lessons) {
          chap.lessons.forEach((less: any, lIdx: number) => {
            const lessonPath = ["chapters", cIdx, "lessons", lIdx];
            paths.push([...lessonPath, "title"]);
            paths.push([...lessonPath, "duration"]);

            if (less.type === "video") {
              paths.push([...lessonPath, "videoUrl"]);
            } else if (less.type === "document") {
              paths.push([...lessonPath, "docFile"]);
            } else if (less.type === "slide") {
              paths.push([...lessonPath, "slideFile"]);
            }
          });
        }
      });
    }

    if (currentStep === 2) {
      chapters.forEach((chap: any, cIdx: number) => {
        if (chap.lessons) {
          chap.lessons.forEach((less: any, lIdx: number) => {
            if (less.quizzes) {
              less.quizzes.forEach((quiz: any, qIdx: number) => {
                const quizPath = [
                  "chapters",
                  cIdx,
                  "lessons",
                  lIdx,
                  "quizzes",
                  qIdx,
                ];
                paths.push([...quizPath, "title"]);

                if (quiz.questions) {
                  quiz.questions.forEach((q: any, questionIdx: number) => {
                    const qPath = [...quizPath, "questions", questionIdx];
                    paths.push([...qPath, "title"]);
                    paths.push([...qPath, "score"]);

                    if (q.type === "choice" && q.options) {
                      q.options.forEach((oIdx: number) => {
                        paths.push([...qPath, "options", oIdx, "content"]);
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }

    return paths;
  };

  const validateCurrentStep = async () => {
    try {
      const fields = getFieldsToValidate();

      if (fields.length > 0) {
        await form.validateFields(fields);
      }

      if (currentStep === 1) {
        const chapters = form.getFieldValue("chapters");
        if (!chapters || chapters.length === 0) {
          message.error("Vui lòng tạo ít nhất 1 chương nội dung!");
          return false;
        }
      }

      return true;
    } catch (error: any) {
      console.error("Validation Failed:", error);
      if (error.errorFields?.length > 0) {
        form.scrollToField(error.errorFields[0].name, {
          behavior: "smooth",
          block: "center",
        });
        message.error("Vui lòng điền đầy đủ thông tin còn thiếu (được tô đỏ)!");
      }
      return false;
    }
  };

  const handleStepChange = async (targetStep: number) => {
    if (targetStep > currentStep) {
      const isValid = await validateCurrentStep();
      if (!isValid) return;
    }

    saveSnapshot(targetStep);
    setCurrentStep(targetStep);
  };

  const next = () => handleStepChange(currentStep + 1);
  const prev = () => handleStepChange(currentStep - 1);
  const goTo = (targetStep: number) => handleStepChange(targetStep);

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
      await form.validateFields();
      const values = form.getFieldsValue(true);
      mutation.mutate({ ...values, status: values.status ?? 0 });
    } catch (e: any) {
      message.error("Vui lòng kiểm tra lại form");
      if (e.errorFields?.length > 0) {
        const firstErrorPath = e.errorFields[0].name;
        form.scrollToField(firstErrorPath, {
          behavior: "smooth",
          block: "center",
        });
      }
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
    isEditMode,
  };
};
