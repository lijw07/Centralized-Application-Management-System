export interface NewUserForm {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
    reEnterPassword: string;
    role: string;
}

export interface EditUserForm {
    userId: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phoneNumber: string;
    role: string;
    isActive: boolean;
}

export interface EditTemporaryUserForm {
    temporaryUserId: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phoneNumber: string;
}

export interface Role {
  userRoleId: string;
  role: string;
  createdAt: string;
  createdBy: string;
}

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  role: string;
  lastLogin?: string;
  createdAt: string;
  isTemporary?: boolean;
}
