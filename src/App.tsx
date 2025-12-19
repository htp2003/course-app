import { Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import MainLayoutWrapper from "./app/(main)/layout";
import CreateCoursePage from "./app/(main)/course-management/create";
import CourseListPage from "./app/(main)/course-management/list";

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
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<MainLayoutWrapper />}>
          <Route
            path="/dashboard"
            element={<div>Dashboard Content Demo</div>}
          />

          <Route
            path="/course-management/create"
            element={<CreateCoursePage />}
          />
          < Route
            path="/course-management/list"
            element={<CourseListPage />}
          />
        </Route>
      </Routes>
    </ConfigProvider>
  );
}

export default App;
