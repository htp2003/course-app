import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import type { TGetCoursesParams } from "../types";

export const useCourseParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const params: TGetCoursesParams = useMemo(() => {
    const page = Number(searchParams.get("Page")) || 1;
    const pageSize = Number(searchParams.get("PageSize")) || 10;

    const title = searchParams.get("Title") || undefined;
    const status = searchParams.get("Status")
      ? Number(searchParams.get("Status"))
      : undefined;
    const type = searchParams.get("Type")
      ? Number(searchParams.get("Type"))
      : undefined;

    const topicsParam = searchParams.get("Topics");
    const topics = topicsParam
      ? topicsParam.split(",").map(Number).filter((n) => !isNaN(n))
      : undefined;

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

  const setParams = (newParams: Partial<TGetCoursesParams>) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(newParams).forEach(([key, value]) => {
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
