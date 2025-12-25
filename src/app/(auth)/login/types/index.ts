export type TLoginRequest = {
  username: string;
  password: string;
};

export type TLoginResult = {
  accessToken: string;
  department: any;
  expiresIn: number;
  fullName: string;
  id: number;
  role: string;
  roleId: number;
  userGroupId: number;
  permissions: any[];
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
