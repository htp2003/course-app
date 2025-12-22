import { Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, App as AntdApp } from "antd";
import { MainLayout } from "./components/layouts/main-layout";
import CreateCoursePage from "./app/(main)/course-management/create";
import CourseListPage from "./app/(main)/course-management/list";
import { ProtectedRoute } from "./components/auth/protected-route";
import { LoginPage } from "./app/(auth)/login/page";

function App() {
  return (
    <ConfigProvider
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
        },
      }}
    >
      <AntdApp>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
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
                element={<CreateCoursePage />}
              />
              <Route
                path="/course-management/list"
                element={<CourseListPage />}
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
