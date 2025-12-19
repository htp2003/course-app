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
        {
          key: "/course-management/create",
          icon: <PlusCircleOutlined />,
          label: "Tạo khóa học",
        },
        {
          key: "/course-management/list",
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
      theme="dark"
      width={250}
    >
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <div className="truncate px-4">
          <span className="font-extrabold text-xl tracking-wider text-center block text-[#4F46E5]">
            {collapsed ? "LMS" : "LMS ADMIN"}
          </span>
        </div>
      </div>

      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={[location.pathname]}
        defaultOpenKeys={["course-management"]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        className="border-none"
      />
    </Sider>
  );
};
