import React from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  ReadOutlined,
  PlusCircleOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Sider } = Layout;

type TAppSidebarProps = {
  collapsed: boolean;
};

export const AppSidebar = ({ collapsed }: TAppSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Menu Items cấu hình
  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "course-management",
      icon: <ReadOutlined />,
      label: "Quản lý khóa học",
      children: [
        // Submenu
        {
          key: "/course-management/create",
          icon: <PlusCircleOutlined />,
          label: "Tạo khóa học",
        },
        {
          key: "/course-management/list", // Giả sử sau này có trang list
          icon: <UnorderedListOutlined />,
          label: "Danh sách",
        },
      ],
    },
  ];

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className="h-screen sticky top-0 left-0 border-r border-gray-200"
      theme="light"
      width={250}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <div className="truncate px-4">
          {/* text-[#4F46E5]: Màu chữ Indigo, trùng màu chủ đạo theme */}
          <span className="font-extrabold text-xl tracking-wider text-center block text-[#4F46E5]">
            {collapsed ? "LMS" : "LMS ADMIN"}
          </span>
        </div>
      </div>

      {/* Menu */}
      <Menu
        theme="light"
        mode="inline"
        defaultSelectedKeys={[location.pathname]}
        defaultOpenKeys={["course-management"]} // Mặc định mở menu con
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        className="border-none"
      />
    </Sider>
  );
};
