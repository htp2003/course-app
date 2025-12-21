import { useState } from "react";
import { Layout } from "antd";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { AppFooter } from "./app-footer";
import { Outlet } from "react-router-dom";

const { Content } = Layout;

export const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="min-h-screen">
      <AppSidebar collapsed={collapsed} />

      <Layout className="transition-all duration-200">
        <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} />

        <Content className="m-4 overflow-initial">
          <div className="p-6 min-h-[360px] bg-white rounded-lg shadow-sm h-full">
            <Outlet />
          </div>
        </Content>

        <AppFooter />
      </Layout>
    </Layout>
  );
};