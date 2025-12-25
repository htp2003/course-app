import {
  Layout,
  Button,
  Dropdown,
  type MenuProps,
  theme,
  Avatar,
  App,
} from "antd";
import {
  RightOutlined,
  LogoutOutlined,
  DownOutlined,
  UserOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/auth-context";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;

type Props = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
};

export const AppHeader = ({ collapsed, setCollapsed }: Props) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const handleLogout = async () => {
    await logout();
    message.success("Đăng xuất thành công!");
    navigate("/login");
  };

  const items: MenuProps["items"] = [
    {
      key: "logout",
      label: (
        <span onClick={handleLogout} className="text-red-500 font-medium">
          Đăng xuất
        </span>
      ),
      icon: <LogoutOutlined className="text-red-500" />,
    },
  ];

  return (
    <Header
      style={{ padding: 0, background: colorBgContainer }}
      className="flex items-center justify-between px-4 shadow-sm sticky top-0 z-20"
    >
      <Button
        type="text"
        icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{ fontSize: "16px", width: 64, height: 64 }}
      />

      <div className="mr-6">
        <Dropdown
          menu={{ items }}
          placement="bottomRight"
          arrow
          trigger={["click"]}
        >
          <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 py-1 px-2 rounded transition-all select-none border border-transparent hover:border-gray-200 group">
            <Avatar
              style={{ backgroundColor: "#87d068" }}
              icon={<UserOutlined />}
            />
            <div className="flex flex-col items-end justify-center">
              <span className="text-sm font-bold text-gray-800 leading-none mb-2">
                {user?.fullName || "User"}
              </span>

              <span className="text-[10px] text-indigo-600 font-bold uppercase leading-none">
                {user?.role || "Member"}
              </span>
            </div>

            <DownOutlined className="text-gray-400 text-[10px]" />
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};
