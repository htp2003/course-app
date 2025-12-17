import { useState } from "react";
import { Layout, Button, theme } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { AppSidebar } from "./app-sidebar";
import { Outlet } from "react-router-dom";

const { Header, Content, Footer } = Layout;

export const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout className="min-h-screen">
      <AppSidebar collapsed={collapsed} />

      <Layout style={{ minHeight: "100vh" }}>
        <Header
          style={{ padding: 0, background: colorBgContainer }}
          className="flex items-center justify-between px-4 shadow-sm z-10"
        >
          <Button
            type="text"
            icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: "16px", width: 64, height: 64 }}
          />
          <div className="mr-4 font-semibold text-gray-600">Admin User</div>
        </Header>

        <Content className="m-4 overflow-initial">
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
            className="shadow-sm h-full"
          >
            <Outlet />
          </div>
        </Content>

        <Footer style={{ textAlign: "center" }}>
          LMS System ©{new Date().getFullYear()} Created by Tan Phat with
          assistance from Gemini
        </Footer>
      </Layout>
    </Layout>
  );
};
