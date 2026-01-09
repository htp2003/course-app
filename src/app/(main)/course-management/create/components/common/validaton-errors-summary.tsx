import { Form, notification } from "antd";
import { useEffect, useMemo, useRef } from "react";

export const ValidationErrorsSummary = ({
  currentStep,
}: {
  currentStep: number;
}) => {
  const form = Form.useFormInstance();

  const [api, contextHolder] = notification.useNotification();
  const NOTIFICATION_PREFIX = "course-wizard-validation-error";
  const openedKeysRef = useRef<Set<string>>(new Set());

  const errorsToDisplay = useMemo(() => {
    const allErrors = form.getFieldsError().filter((e) => e.errors.length > 0);

    return allErrors.filter((err) => {
      const path = err.name;

      if (currentStep === 0) return path[0] !== "chapters";
      if (currentStep === 1)
        return path[0] === "chapters" && !path.includes("quizzes");
      if (currentStep === 2)
        return path[0] === "chapters" && path.includes("quizzes");

      return false;
    });
  }, [form, currentStep]);

  useEffect(() => {
    const nextKeys = new Set<string>();

    for (const err of errorsToDisplay) {
      const nameKey = Array.isArray(err.name)
        ? err.name.join(".")
        : String(err.name);
      const message = err.errors[0] ?? "Thông tin chưa hợp lệ";
      const key = `${NOTIFICATION_PREFIX}:${currentStep}:${nameKey}:${message}`;
      nextKeys.add(key);

      if (!openedKeysRef.current.has(key)) {
        api.open({
          key,
          type: "error",
          placement: "topRight",
          duration: 0,
          message: <span className="font-bold">Thông tin chưa hợp lệ</span>,
          description: <span className="text-sm">{message}</span>,
          onClick: () => {
            form.scrollToField(err.name, {
              behavior: "smooth",
              block: "center",
            });
          },
        });
      }
    }

    for (const key of openedKeysRef.current) {
      if (!nextKeys.has(key)) {
        api.destroy(key);
      }
    }

    openedKeysRef.current = nextKeys;
  }, [api, currentStep, errorsToDisplay, form]);

  useEffect(() => {
    return () => {
      for (const key of openedKeysRef.current) {
        api.destroy(key);
      }
      openedKeysRef.current = new Set();
    };
  }, [api]);

  return <>{contextHolder}</>;
};
