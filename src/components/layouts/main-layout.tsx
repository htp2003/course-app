import { useState, useEffect } from "react";
import { Layout, Grid } from "antd";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { AppFooter } from "./app-footer";
import { AppBreadcrumb } from "./app-breadcrumb";
import { Outlet } from "react-router-dom";

const { Content } = Layout;
const { useBreakpoint } = Grid;

export const MainLayout = () => {
  const screens = useBreakpoint();
  const [collapsed, setCollapsed] = useState(() => !screens.lg);

  useEffect(() => {
    setCollapsed(!screens.lg);
  }, [screens.lg]);

  return (
    <Layout className="min-h-screen">
      <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <Layout className="transition-all duration-200 w-full">
        <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} />

        <Content className="m-2 md:m-4 overflow-initial">
          <AppBreadcrumb />

          <div className="p-3 md:p-6 min-h-[360px] bg-white rounded-lg shadow-sm h-full">
            <Outlet />
          </div>
        </Content>

        <AppFooter />
      </Layout>
    </Layout>
  );
};
