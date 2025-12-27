import type { UploadChangeParam } from "antd/es/upload";
import type { UploadFile } from "antd/es/upload/interface";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

export const getLabelFromValue = <T = string>(
  value: T,
  options: { label: string; value: T }[],
  eq?: (a: T, b: T) => boolean
): string => {
  const found = options.find((opt) =>
    eq ? eq(opt.value, value) : opt.value === value
  );
  return found ? found.label : String(value);
};

export const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  try {
    if (typeof err === "string") return err;
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
};

export const normFile = (e: UploadChangeParam | UploadFile[]) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

export const formatDate = (
  date: string | Date | number | undefined | null,
  includeTime: boolean = true
): string => {
  if (!date) return "--";

  try {
    const d = new Date(date);

    if (isNaN(d.getTime())) return "--";

    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      ...(includeTime && {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    }).format(d);
  } catch (error) {
    return "--";
  }
};

/**
 * Block selecting dates before today. Works with AntD DatePicker/RangePicker disabledDate prop.
 */
export const disablePastDates = (current: Dayjs): boolean => {
  if (!current) return false;
  return current.isBefore(dayjs().startOf("day"));
};
