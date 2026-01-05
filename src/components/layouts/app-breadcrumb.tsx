import { useMemo } from "react";
import { Breadcrumb, type BreadcrumbProps } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { Link, useLocation, matchPath } from "react-router-dom";

type BreadcrumbConfig = {
    path: string;
    label: string | ((params: Record<string, string | undefined>) => string);
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
        path: "/course-management/:rest/*",
        label: "Quản lý khóa học",
        to: "/course-management/list",
        end: false,
    },
    { path: "/course-management/list", label: "Danh sách khóa học" },
    { path: "/course-management/create", label: "Tạo khóa học" },
    {
        path: "/course-management/detail/:id",
        label: "Danh sách khóa học",
        to: "/course-management/list",
    },
    { path: "/course-management/detail/:id", label: "Chi tiết khóa học" },
];

export const AppBreadcrumb = () => {
    const location = useLocation();

    const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
        const matches =
            breadcrumbConfig
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
                .filter((match): match is MatchedBreadcrumb => Boolean(match)) || [];

        const items: BreadcrumbItem[] = [
            {
                title:
                    matches.length === 0 ? (
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

        matches.forEach((item, index) => {
            if (!item) return;

            const isLast = index === matches.length - 1;
            const label =
                typeof item.label === "function"
                    ? item.label(item.params ?? {})
                    : item.label;

            const target = item.to ?? item.matchedPath;

            items.push({
                title: isLast ? (
                    <span className="text-gray-800 font-semibold">{label}</span>
                ) : (
                    <Link
                        to={target}
                        className="text-gray-600 hover:text-indigo-600"
                    >
                        {label}
                    </Link>
                ),
            });
        });

        return items;
    }, [location.pathname]);

    return (
        <Breadcrumb
            items={breadcrumbItems}
            separator=">"
            className="text-sm mb-3 md:mb-4"
        />
    );
};
