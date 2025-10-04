// User model representing the application user
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  roles: Role[];
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  lastLogin?: Date;
}

// Use backend format exactly
export interface Role {
  id: number;
  name: 'ROLE_ADMIN' | 'ROLE_PROJECT_MANAGER' | 'ROLE_TEAM_MEMBER';
  description: string;
}

// Helper type for frontend
export type RoleName = 'ROLE_ADMIN' | 'ROLE_PROJECT_MANAGER' | 'ROLE_TEAM_MEMBER';

// Helper functions for role conversion
export function toFrontendRole(backendRole: string): RoleName {
  const roleMap: { [key: string]: RoleName } = {
    'ROLE_ADMIN': 'ROLE_ADMIN',
    'ROLE_PROJECT_MANAGER': 'ROLE_PROJECT_MANAGER', 
    'ROLE_TEAM_MEMBER': 'ROLE_TEAM_MEMBER',
    'ADMIN': 'ROLE_ADMIN',
    'PROJECT_MANAGER': 'ROLE_PROJECT_MANAGER',
    'TEAM_MEMBER': 'ROLE_TEAM_MEMBER'
  };
  return roleMap[backendRole] || 'ROLE_TEAM_MEMBER';
}

export function toBackendRole(frontendRole: RoleName): string {
  return frontendRole; // Same format in backend
}