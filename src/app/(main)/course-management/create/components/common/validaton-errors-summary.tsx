import { Form, notification } from "antd";
import type { NamePath } from "antd/es/form/interface";
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

    const stepErrors = allErrors.filter((err) => {
      const path = err.name;

      if (currentStep === 0) return path[0] !== "chapters";
      if (currentStep === 1)
        return path[0] === "chapters" && !path.includes("quizzes");
      if (currentStep === 2)
        return path[0] === "chapters" && path.includes("quizzes");

      return false;
    });

    const grouped = new Map<string, { name: NamePath; errors: string[] }>();

    const push = (key: string, item: { name: NamePath; errors: string[] }) => {
      if (!grouped.has(key)) grouped.set(key, item);
    };

    for (const err of stepErrors) {
      const path = err.name as (string | number)[];
      const message = err.errors[0] ?? "Thông tin chưa hợp lệ";

      const optionsIdx = path.lastIndexOf("options");
      const isOptionContentField =
        optionsIdx >= 0 &&
        path.includes("content") &&
        message === "Nhập đáp án";
      const isOptionsListError =
        optionsIdx >= 0 && message === "Vui lòng điền nội dung tất cả đáp án";

      if (isOptionContentField || isOptionsListError) {
        const optionsPath = path.slice(0, optionsIdx + 1) as NamePath;
        const groupKey = `options:${currentStep}:${(
          optionsPath as (string | number)[]
        ).join(".")}`;
        push(groupKey, {
          name: optionsPath,
          errors: ["Vui lòng điền nội dung tất cả đáp án"],
        });
        continue;
      }

      const nameKey = Array.isArray(path) ? path.join(".") : String(path);
      push(`field:${currentStep}:${nameKey}:${message}`, {
        name: err.name,
        errors: [message],
      });
    }

    return Array.from(grouped.values());
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
