import { Layout, Button, Avatar, Dropdown, type MenuProps, theme } from "antd";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LogoutOutlined
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

    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: <span onClick={handleLogout} className="text-red-500 font-medium">Đăng xuất</span>,
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
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: "16px", width: 64, height: 64 }}
            />

            <div className="mr-6 flex items-center gap-3">
                <span className="font-medium text-gray-700 hidden sm:block">Admin User</span>

                <Dropdown menu={{ items }} placement="bottomRight" arrow>
                    <Avatar
                        size="large"
                        icon={<UserOutlined />}
                        className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 transition-colors"
                    />
                </Dropdown>
            </div>
        </Header>
    );
};