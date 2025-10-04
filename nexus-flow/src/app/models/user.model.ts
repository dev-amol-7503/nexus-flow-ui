// User model representing the application user
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  roles: Role[];
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Role {
  id: number;
  name: 'ADMIN' | 'PROJECT_MANAGER' | 'TEAM_MEMBER';
  description: string;
}

// Add this helper type for creating mock data
export type RoleName = 'ADMIN' | 'PROJECT_MANAGER' | 'TEAM_MEMBER';