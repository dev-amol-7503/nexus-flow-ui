import { Project } from './project.model';
import { User } from './user.model';
import { Priority } from './project.model';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  project: Project;
  assignee?: User;
  reporter: User;
  tags: string[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export interface Comment {
  id: number;
  content: string;
  author: User;
  task: Task;
  createdAt: Date;
  updatedAt: Date;
}