const TOKEN_KEY = "access_token";
const USER_KEY = "user_info";

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("Lỗi khi lấy token:", error);
    return null;
  }
};

export const setToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error("Lỗi khi lưu token:", error);
  }
};

export const removeToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error("Lỗi khi xóa token:", error);
  }
};

export const hasToken = (): boolean => {
  return getToken() !== null;
};

export const getUser = (): string | null => {
  try {
    return localStorage.getItem(USER_KEY);
  } catch (error) {
    console.error("Lỗi khi lấy user:", error);
    return null;
  }
};

export const setUser = (userJson: string): void => {
  try {
    localStorage.setItem(USER_KEY, userJson);
  } catch (error) {
    console.error("Lỗi khi lưu user:", error);
  }
};

export const removeUser = (): void => {
  try {
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error("Lỗi khi xóa user:", error);
  }
};

export const clearAllAuth = (): void => {
  removeToken();
  removeUser();
};
