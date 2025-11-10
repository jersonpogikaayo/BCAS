// user.model.ts

export interface UserManager {
  firstName: string;
  lastName: string;
  level: number;
  isArchived: boolean;
  joinDate: string;
  lastLogin: string | null;
  profileImage: string | null;
  managers: UserManager[] | null;
  id: number;
  userName: string;
  normalizedUserName: string;
  email: string;
  normalizedEmail: string;
  emailConfirmed: boolean;
  passwordHash: string;
  securityStamp: string;
  concurrencyStamp: string;
  phoneNumber: string | null;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnd: string | null;
  lockoutEnabled: boolean;
  accessFailedCount: number;
}

export interface User {
  firstName: string;
  lastName: string;
  level: number;
  isArchived: boolean;
  joinDate: string;
  lastLogin: string | null;
  profileImage: string | null;
  managers: UserManager[];
  id: number;
  userName: string;
  normalizedUserName: string;
  email: string;
  normalizedEmail: string;
  emailConfirmed: boolean;
  passwordHash: string;
  securityStamp: string;
  concurrencyStamp: string;
  phoneNumber: string | null;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnd: string | null;
  lockoutEnabled: boolean;
  accessFailedCount: number;
}

export type UsersResponse = User[];

// Simplified model for UI purposes (optional)
export interface SimpleUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  level: number;
  isArchived: boolean;
  joinDate: Date;
  lastLogin: Date | null;
  phoneNumber: string | null;
  managers: SimpleUser[];
}

// For dropdown/selection purposes
export interface UserOption {
  id: number;
  displayName: string;
  email: string;
  isActive: boolean;
}