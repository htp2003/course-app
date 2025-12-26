export type TLoginRequest = {
  username: string;
  password: string;
};

export type TDepartment = {
  id: number;
  name: string;
};

export type TPermission = {
  id: number;
  name: string;
  code: string;
};

export type TLoginResult = {
  accessToken: string;
  department: TDepartment | null;
  expiresIn: number;
  fullName: string;
  id: number;
  role: string;
  roleId: number;
  userGroupId: number;
  permissions: TPermission[];
};

export type TLoginResponse = {
  statusCode: number;
  message: string;
  result: TLoginResult;
};

export type TLogoutResponse = {
  statusCode: number;
  message: string;
  result?: unknown;
};
