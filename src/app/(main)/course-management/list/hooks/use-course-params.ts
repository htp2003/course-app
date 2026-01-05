import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import type { TGetCoursesParams } from "../types";
import {
  COURSE_STATUS_LIST,
  COURSE_TYPE_LIST,
  COURSE_CATEGORIES,
} from "../../common/constants/constants";

const PAGE_MIN = 1;
const PAGE_SIZE_DEFAULT = 10;
const PAGE_SIZE_MAX = 50;

const allowedStatus = new Set<number>(
  COURSE_STATUS_LIST.map((item) => item.value)
);
const allowedType = new Set<number>(COURSE_TYPE_LIST.map((item) => item.value));
const allowedTopics = new Set<number>(
  COURSE_CATEGORIES.map((item) => item.value)
);

const sanitizeStatus = (value?: number) =>
  value !== undefined && allowedStatus.has(value) ? value : undefined;

const sanitizeType = (value?: number) =>
  value !== undefined && allowedType.has(value) ? value : undefined;

const sanitizeTopics = (values?: number[]) => {
  if (!values || values.length === 0) return undefined;
  const filtered = values.filter((item) => allowedTopics.has(item));
  return filtered.length ? filtered : undefined;
};

const sanitizePage = (value?: number) => {
  if (!value || Number.isNaN(value) || value < PAGE_MIN) return PAGE_MIN;
  return value;
};

const sanitizePageSize = (value?: number) => {
  if (!value || Number.isNaN(value)) return PAGE_SIZE_DEFAULT;
  if (value < 1) return PAGE_SIZE_DEFAULT;
  return Math.min(value, PAGE_SIZE_MAX);
};

export const useCourseParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const params: TGetCoursesParams = useMemo(() => {
    const page = sanitizePage(Number(searchParams.get("Page")));
    const pageSize = sanitizePageSize(Number(searchParams.get("PageSize")));

    const title = searchParams.get("Title") || undefined;

    const rawStatus = searchParams.get("Status");
    const parsedStatus = rawStatus ? Number(rawStatus) : undefined;
    const status = sanitizeStatus(parsedStatus);

    const rawType = searchParams.get("Type");
    const parsedType = rawType ? Number(rawType) : undefined;
    const type = sanitizeType(parsedType);

    const topicsParam = searchParams.get("Topics");
    const parsedTopics = topicsParam
      ? topicsParam
          .split(",")
          .map(Number)
          .filter((n) => !isNaN(n))
      : undefined;
    const topics = sanitizeTopics(parsedTopics);

    const startTime = searchParams.get("StartTime") || undefined;
    const endTime = searchParams.get("EndTime") || undefined;

    return {
      Page: page,
      PageSize: pageSize,
      Title: title,
      Status: status,
      Type: type,
      Topics: topics,
      StartTime: startTime,
      EndTime: endTime,
    };
  }, [searchParams]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    let changed = false;

    const rawPage = Number(searchParams.get("Page"));
    const sanitizedPage = sanitizePage(rawPage);
    if (rawPage !== sanitizedPage) {
      nextParams.set("Page", String(sanitizedPage));
      changed = true;
    }

    const rawPageSize = Number(searchParams.get("PageSize"));
    const sanitizedPageSize = sanitizePageSize(rawPageSize);
    if (rawPageSize !== sanitizedPageSize) {
      nextParams.set("PageSize", String(sanitizedPageSize));
      changed = true;
    }

    const rawStatus = searchParams.get("Status");
    const parsedStatus = rawStatus ? Number(rawStatus) : undefined;
    if (rawStatus && sanitizeStatus(parsedStatus) === undefined) {
      nextParams.delete("Status");
      changed = true;
    }

    const rawType = searchParams.get("Type");
    const parsedType = rawType ? Number(rawType) : undefined;
    if (rawType && sanitizeType(parsedType) === undefined) {
      nextParams.delete("Type");
      changed = true;
    }

    const topicsParam = searchParams.get("Topics");
    const parsedTopics = topicsParam
      ? topicsParam
          .split(",")
          .map(Number)
          .filter((n) => !isNaN(n))
      : undefined;
    const sanitizedTopics = sanitizeTopics(parsedTopics);
    if (topicsParam && !sanitizedTopics) {
      nextParams.delete("Topics");
      changed = true;
    }

    if (changed) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const setParams = (newParams: Partial<TGetCoursesParams>) => {
    const nextParams = new URLSearchParams(searchParams);

    const normalizedParams: Partial<TGetCoursesParams> = {
      ...newParams,
      Page: sanitizePage(newParams.Page),
      PageSize: sanitizePageSize(newParams.PageSize),
      Status: sanitizeStatus(newParams.Status),
      Type: sanitizeType(newParams.Type),
      Topics: sanitizeTopics(newParams.Topics),
    };

    Object.entries(normalizedParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        nextParams.delete(key);
      } else if (Array.isArray(value)) {
        nextParams.delete(key);
        if (value.length > 0) {
          nextParams.set(key, value.join(","));
        }
      } else {
        nextParams.set(key, String(value));
      }
    });

    setSearchParams(nextParams);
  };

  return { params, setParams };
};
