import { Layout, Menu, ConfigProvider } from "antd";
import {
  DashboardOutlined,
  ReadOutlined,
  UnorderedListOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const { Sider } = Layout;

type TAppSidebarProps = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
};

const menuTheme = {
  components: {
    Menu: {
      darkItemBg: "transparent",
      darkItemSelectedBg: "#3b82f6",
      darkItemSelectedColor: "#ffffff",
      darkItemHoverColor: "#60a5fa",
      itemBorderRadius: 8,
      itemMarginInline: 8,
    },
  },
};

export const AppSidebar = ({ collapsed, setCollapsed }: TAppSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined style={{ fontSize: "18px" }} />,
      label: "Dashboard",
    },
    {
      key: "course-management",
      icon: <ReadOutlined style={{ fontSize: "18px" }} />,
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

  useEffect(() => {
    const path = location.pathname;
    const keysToOpen: string[] = [];
    if (path.includes("/course-management")) {
      keysToOpen.push("course-management");
    }
    if (!collapsed) setOpenKeys(keysToOpen);
  }, [location.pathname, collapsed]);

  return (
    <ConfigProvider theme={menuTheme}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        className="h-screen sticky top-0 left-0 border-r border-slate-800 z-50 !bg-slate-900 shadow-xl"
      >
        <div className="flex flex-col h-full">
          <div className="h-20 flex items-center justify-center border-b border-slate-800/50 shrink-0 mb-2">
            <div
              className={`truncate transition-all duration-300 ${
                collapsed ? "px-2" : "px-4"
              }`}
            >
              <span className="font-black text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                {collapsed ? "LMS" : "LMS ADMIN"}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[location.pathname]}
              openKeys={collapsed ? [] : openKeys}
              onOpenChange={(keys) => setOpenKeys(keys)}
              items={menuItems}
              onClick={({ key }) => navigate(key)}
              className="!bg-transparent font-medium"
            />
          </div>

          <div className="p-4 border-t border-slate-800/50 shrink-0">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-center h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200"
            >
              {collapsed ? <RightOutlined /> : <LeftOutlined />}
            </button>
          </div>
        </div>
      </Sider>
    </ConfigProvider>
  );
};
