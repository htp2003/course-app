import { Button, Card, Form, Input, App, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context/auth-context";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { loginAPI } from "./services/api";
import type { TLoginRequest, TLoginResponse } from "./types";

export const LoginPage = () => {
  const { login } = useAuth();
  const { message } = App.useApp();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (values: TLoginRequest) => loginAPI.login(values),
    onSuccess: (data: TLoginResponse) => {
      const res = data.result;

      if (!res || !res.accessToken) {
        message.error("Lỗi: Không tìm thấy Access Token trong phản hồi!");
        return;
      }

      message.success("Đăng nhập thành công!");

      const userProfile = {
        id: res.id,
        username: res.fullName,
        fullName: res.fullName,
        role: res.role,
        avatar: "",
      };

      login(res.accessToken, userProfile);

      navigate("/course-management/list");
    },
    onError: (error: any) => {
    
      message.error(typeof error === "string" ? error : "Đăng nhập thất bại");
    },
  });

  const onFinish = (values: TLoginRequest) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md shadow-lg rounded-xl">
        <div className="text-center mb-8">
          <Typography.Title level={2} className="text-indigo-600 !mb-0">
            Course Admin
          </Typography.Title>
          <Typography.Text type="secondary">
            Hệ thống quản lý khóa học
          </Typography.Text>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
          disabled={loginMutation.isPending}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Vui lòng nhập tài khoản!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Tài khoản / Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="bg-indigo-600"
              loading={loginMutation.isPending}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
