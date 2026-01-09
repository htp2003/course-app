import { useMemo, useEffect } from "react";
import { Breadcrumb, type BreadcrumbProps } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { Link, useLocation, matchPath, type Location } from "react-router-dom";

type BreadcrumbConfig = {
  path: string;
  label:
    | string
    | ((
        params: Record<string, string | undefined>,
        location: Location
      ) => string);
  to?: string;
  end?: boolean;
};

type MatchedBreadcrumb = BreadcrumbConfig & {
  matchedPath: string;
  params: Record<string, string | undefined>;
};

type BreadcrumbItem = NonNullable<BreadcrumbProps["items"]>[number];

const breadcrumbConfig: BreadcrumbConfig[] = [
  { path: "/dashboard", label: "Dashboard" },
  {
    path: "/course-management/*",
    label: "Danh sách khóa học",
    to: "/course-management/list",
    end: false,
  },
  { path: "/course-management/create", label: "Tạo khóa học" },
  {
    path: "/course-management/detail/:id",
    label: (params, location) => {
      const state = location.state as unknown as
        | {
            courseName?: unknown;
            name?: unknown;
            title?: unknown;
            course?: { name?: unknown; title?: unknown };
          }
        | null
        | undefined;
      const nameCandidate =
        state?.courseName ??
        state?.name ??
        state?.title ??
        state?.course?.name ??
        state?.course?.title;
      const name =
        typeof nameCandidate === "string" && nameCandidate.trim()
          ? nameCandidate.trim()
          : undefined;

      return name ?? params.id ?? "Chi tiết khóa học";
    },
  },
];

export const AppBreadcrumb = () => {
  const location = useLocation();

  const matches = useMemo(() => {
    return breadcrumbConfig
      .map((config) => {
        const match = matchPath(
          { path: config.path, end: config.end ?? true },
          location.pathname
        );

        if (!match) return null;

        return {
          ...config,
          matchedPath: match.pathname,
          params: match.params,
        };
      })
      .filter((match): match is MatchedBreadcrumb => Boolean(match));
  }, [location.pathname]);

  useEffect(() => {
    if (matches.length > 0) {
      const lastMatch = matches[matches.length - 1];
      const label =
        typeof lastMatch.label === "function"
          ? lastMatch.label(lastMatch.params ?? {}, location)
          : lastMatch.label;

      document.title = `${label} | LMS Admin`;
    } else {
      document.title = "LMS Admin";
    }
  }, [matches, location]);

  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    const displayMatches = matches.filter(
      (item) => item.matchedPath !== "/dashboard"
    );

    const items: BreadcrumbItem[] = [
      {
        title:
          displayMatches.length === 0 ? (
            <span className="text-gray-800 font-semibold flex items-center gap-1">
              <HomeOutlined /> Trang chủ
            </span>
          ) : (
            <Link
              className="text-gray-600 hover:text-indigo-600 flex items-center gap-1"
              to="/dashboard"
            >
              <HomeOutlined /> Trang chủ
            </Link>
          ),
      },
    ];

    displayMatches.forEach((item, index) => {
      const isLast = index === displayMatches.length - 1;
      const label =
        typeof item.label === "function"
          ? item.label(item.params ?? {}, location)
          : item.label;

      const target = item.to ?? item.matchedPath;

      items.push({
        title: isLast ? (
          <span className="text-gray-800 font-semibold">{label}</span>
        ) : (
          <Link to={target} className="text-gray-600 hover:text-indigo-600">
            {label}
          </Link>
        ),
      });
    });

    return items;
  }, [matches, location]);

  return (
    <Breadcrumb
      items={breadcrumbItems}
      separator="/"
      className="text-sm mb-3 md:mb-4"
    />
  );
};
