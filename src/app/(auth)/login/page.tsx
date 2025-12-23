import { Button, Card, Form, Input, App, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context/auth-context";
import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
  const { login } = useAuth();
  const { message } = App.useApp();
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    if (values.username === "admin" && values.password === "123456") {
      message.success("Đăng nhập thành công!");

      const fakeToken = "ey_fake_token_" + Date.now();

      login(fakeToken);

      navigate("/course-management/list");
    } else {
      message.error("Sai tài khoản hoặc mật khẩu (admin/123456)");
    }
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
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Vui lòng nhập tài khoản!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Tài khoản (admin)" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu (123456)"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="bg-indigo-600"
            >
              Đăng nhập
            </Button>
          </Form.Item>

          <div className="text-center text-gray-400 text-sm">
            Demo Account: admin / 123456
          </div>
        </Form>
      </Card>
    </div>
  );
};
