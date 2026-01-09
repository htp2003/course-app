import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, App as AntdApp, Spin } from "antd";
import { MainLayout } from "./components/layouts/main-layout";
import { ProtectedRoute } from "./components/auth/protected-route";
import { PublicRoute } from "./components/auth/public-route";
import { LoginPage } from "./app/(auth)/login/page";

const CourseListPage = lazy(
  () => import("./app/(main)/course-management/list")
);
const CreateCoursePage = lazy(
  () => import("./app/(main)/course-management/create")
);
const CourseDetailPage = lazy(() =>
  import("./app/(main)/course-management/detail/page").then((module) => ({
    default: module.CourseDetailPage,
  }))
);

const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <Spin size="large" tip="Đang tải..." />
  </div>
);

function App() {
  return (
    <ConfigProvider
      componentSize="small"
      theme={{
        token: {
          colorPrimary: "#4F46E5",
          borderRadius: 8,
          fontFamily: "'Be Vietnam Pro', sans-serif",
        },
        components: {
          Layout: {
            bodyBg: "#F1F5F9",
            headerBg: "#FFFFFF",
            siderBg: "#0F172A",
          },
          Menu: {
            darkItemBg: "#0F172A",
            darkItemSelectedBg: "#4F46E5",
            darkItemColor: "#94A3B8",
            darkItemSelectedColor: "#FFFFFF",
          },
          Form: {
            itemMarginBottom: 10,
            verticalLabelPadding: "0 0 6px",
          },
        },
      }}
    >
      <AntdApp>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/course-management/login" element={<LoginPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route
                path="/"
                element={<Navigate to="/course-management/list" replace />}
              />

              <Route
                path="/dashboard"
                element={<div>Dashboard Content Demo</div>}
              />

              <Route
                path="/course-management/create"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <CreateCoursePage />
                  </Suspense>
                }
              />
              <Route
                path="/course-management/list"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <CourseListPage />
                  </Suspense>
                }
              />
              <Route
                path="/course-management/detail/:id"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <CourseDetailPage />
                  </Suspense>
                }
              />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
