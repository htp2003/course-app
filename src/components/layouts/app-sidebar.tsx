import { Layout, Menu, Drawer, Grid } from "antd";
import {
  DashboardOutlined,
  ReadOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Sider } = Layout;

type TAppSidebarProps = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
};
export const AppSidebar = ({ collapsed, setCollapsed }: TAppSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = Grid.useBreakpoint();

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
          key: "/course-management/list",
          icon: <UnorderedListOutlined />,
          label: "Danh sách",
        },
      ],
    },
  ];

  return (
    <>
      {/* Desktop/Large screens: keep Sider */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="h-screen sticky top-0 left-0 border-r border-gray-200 hidden lg:block"
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

      {/* Tablet/Mobile: slide-in Drawer controlled by collapsed toggle */}
      {!screens.lg && (
        <Drawer
          placement="left"
          width={250}
          open={!collapsed}
          onClose={() => setCollapsed(true)}
          bodyStyle={{ padding: 0, background: "#001529" }}
          className="lg:hidden"
        >
          <div className="h-16 flex items-center justify-center border-b border-gray-200">
            <div className="truncate px-4">
              <span className="font-extrabold text-xl tracking-wider text-center block text-[#4F46E5]">
                LMS ADMIN
              </span>
            </div>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={[location.pathname]}
            defaultOpenKeys={["course-management"]}
            items={menuItems}
            onClick={({ key }) => {
              navigate(key);
              setCollapsed(true);
            }}
            className="border-none"
          />
        </Drawer>
      )}
    </>
  );
};
