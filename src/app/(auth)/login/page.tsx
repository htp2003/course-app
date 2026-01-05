import { Button, Card, Form, Input, Typography, Checkbox } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import type { TLoginRequest } from "./types";
import { useLoginMutation } from "./hooks/use-login-mutation";

export const LoginPage = () => {
  const loginMutation = useLoginMutation();
  const [form] = Form.useForm();

  useEffect(() => {
    const rememberMe = localStorage.getItem("remember_me");
    const savedUsername = localStorage.getItem("saved_username");

    if (rememberMe === "true" && savedUsername) {
      form.setFieldsValue({
        username: savedUsername,
        remember: true,
      });
    }
  }, [form]);

  const onFinish = (values: TLoginRequest & { remember?: boolean }) => {
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
          form={form}
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

          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Ghi nhớ đăng nhập</Checkbox>
          </Form.Item>

          <Form.Item className="!mt-6">
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
