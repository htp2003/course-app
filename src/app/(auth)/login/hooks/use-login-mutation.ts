import { App } from "antd";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../../context/auth-context";
import { loginAPI } from "../services/api";
import type { TLoginRequest, TLoginResponse } from "../types";

export const useLoginMutation = () => {
  const { login } = useAuth();
  const { message } = App.useApp();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (values: TLoginRequest & { remember?: boolean }) =>
      loginAPI.login(values),
    onSuccess: (data: TLoginResponse, variables) => {
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

      if (variables.remember) {
        localStorage.setItem("remember_me", "true");
        localStorage.setItem("saved_username", variables.username);
      } else {
        localStorage.removeItem("remember_me");
        localStorage.removeItem("saved_username");
      }

      login(res.accessToken, userProfile);
      navigate("/course-management/list");
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "Đăng nhập thất bại";
      message.error(errorMessage);
    },
  });
};
