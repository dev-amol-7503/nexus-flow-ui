import { User } from './user.model';
import { Task } from './task.model';

export interface Project {
  id: number;
  name: string;
  description: string;
  code: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: Date;
  endDate?: Date;
  budget?: number;
  owner: User;
  teamMembers: User[];
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';