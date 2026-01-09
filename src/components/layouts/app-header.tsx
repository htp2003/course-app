import {
  Layout,
  Dropdown,
  type MenuProps,
  theme,
  Avatar,
  App,
} from "antd";
import {
  LogoutOutlined,
  DownOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/auth-context";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;



export const AppHeader = () => {
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
      className="flex items-center justify-end px-6 shadow-sm sticky top-0 z-20 h-16 transition-all duration-200"
    >

      <div className="">
        <Dropdown
          menu={{ items }}
          placement="bottomRight"
          arrow
          trigger={["click"]}
        >
          <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 py-1.5 px-3 rounded-lg transition-all select-none border border-transparent hover:border-gray-200 group">
            <Avatar
              size="default"
              style={{ backgroundColor: "#2563EB" }}
              icon={<UserOutlined />}
            />
            <div className="flex flex-col items-end justify-center">
              <span className="text-sm font-semibold text-gray-700 leading-tight">
                {user?.fullName || "User"}
              </span>

              <span className="text-[11px] text-blue-600 font-bold uppercase leading-tight mt-0.5">
                {user?.role || "Member"}
              </span>
            </div>

            <DownOutlined className="text-gray-400 text-[10px] ml-1" />
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};