import apiClient from "../../../../services/api-client";

import type { TLoginRequest, TLoginResponse, TLogoutResponse } from "../types";

export const loginAPI = {
  login: (payload: TLoginRequest): Promise<TLoginResponse> => {
    return apiClient.post("/admin-panel/authentication/loginv2", payload);
  },

  logout: (token: string): Promise<TLogoutResponse> => {
    return apiClient.post("/admin-panel/authentication/logout", null, {
      params: {
        token: token,
      },
    });
  },
};
