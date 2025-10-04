import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { Task, TaskStatus, Comment } from '../models/task.model';
import { Project } from '../models/project.model';
import { User } from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly API_URL = 'http://localhost:8080/api/tasks';

  // Mock tasks data
  private mockTasks: Task[] = [
    {
      id: 1,
      title: 'Design Homepage Layout',
      description: 'Create modern and responsive homepage design with proper UX principles',
      status: 'DONE',
      priority: 'HIGH',
      dueDate: new Date('2024-02-01'),
      estimatedHours: 8,
      actualHours: 6,
      project: { id: 1, name: 'Website Redesign' } as Project,
      assignee: { id: 3, firstName: 'Team', lastName: 'Member' } as User,
      reporter: { id: 2, firstName: 'Project', lastName: 'Manager' } as User,
      tags: ['design', 'ui', 'responsive'],
      comments: [
        {
          id: 1,
          content: 'Great work on the design! The layout looks clean and modern.',
          author: { id: 2, firstName: 'Project', lastName: 'Manager' } as User,
          task: {} as Task,
          createdAt: new Date('2024-01-18'),
          updatedAt: new Date('2024-01-18')
        }
      ],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: 2,
      title: 'Implement User Authentication',
      description: 'Develop secure login and registration system with JWT tokens',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date('2024-02-15'),
      estimatedHours: 16,
      actualHours: 8,
      project: { id: 1, name: 'Website Redesign' } as Project,
      assignee: { id: 3, firstName: 'Team', lastName: 'Member' } as User,
      reporter: { id: 1, firstName: 'System', lastName: 'Administrator' } as User,
      tags: ['backend', 'security', 'authentication'],
      comments: [],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-25')
    },
    {
      id: 3,
      title: 'Mobile Responsive Design',
      description: 'Ensure all pages are fully responsive on mobile devices',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: new Date('2024-02-28'),
      estimatedHours: 12,
      project: { id: 1, name: 'Website Redesign' } as Project,
      assignee: { id: 3, firstName: 'Team', lastName: 'Member' } as User,
      reporter: { id: 2, firstName: 'Project', lastName: 'Manager' } as User,
      tags: ['responsive', 'mobile', 'css'],
      comments: [],
      createdAt: new Date('2024-01-22'),
      updatedAt: new Date('2024-01-22')
    },
    {
      id: 4,
      title: 'UI Design for Mobile App',
      description: 'Create wireframes and mockups for the mobile application',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date('2024-02-10'),
      estimatedHours: 20,
      project: { id: 2, name: 'Mobile App Development' } as Project,
      assignee: { id: 3, firstName: 'Team', lastName: 'Member' } as User,
      reporter: { id: 2, firstName: 'Project', lastName: 'Manager' } as User,
      tags: ['design', 'mobile', 'wireframe'],
      comments: [],
      createdAt: new Date('2024-01-26'),
      updatedAt: new Date('2024-01-26')
    }
  ];

  constructor(private http: HttpClient) {}

  getTasksByProject(projectId: number): Observable<Task[]> {
    const tasks = this.mockTasks.filter(task => task.project.id === projectId);
    return of(tasks).pipe(delay(600));
  }

  getTasksByUser(userId: number): Observable<Task[]> {
    // For demo, return tasks assigned to user 3 (Team Member)
    const tasks = this.mockTasks.filter(task => task.assignee?.id === userId || userId === 3);
    return of(tasks).pipe(delay(500));
  }

  getTaskById(id: number): Observable<Task> {
    const task = this.mockTasks.find(t => t.id === id);
    if (task) {
      return of(task).pipe(delay(400));
    } else {
      throw new Error('Task not found');
    }
  }

  createTask(task: Partial<Task>): Observable<Task> {
    const newTask: Task = {
      id: this.mockTasks.length + 1,
      title: task.title || 'New Task',
      description: task.description || '',
      status: task.status || 'TODO',
      priority: task.priority || 'MEDIUM',
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours,
      project: task.project || { id: 1, name: 'Default Project' } as Project,
      assignee: task.assignee,
      reporter: task.reporter || { id: 1, firstName: 'System', lastName: 'Administrator' } as User,
      tags: task.tags || [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mockTasks.push(newTask);
    return of(newTask).pipe(delay(700));
  }

  updateTask(id: number, task: Partial<Task>): Observable<Task> {
    const index = this.mockTasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.mockTasks[index] = { ...this.mockTasks[index], ...task, updatedAt: new Date() };
      return of(this.mockTasks[index]).pipe(delay(500));
    } else {
      throw new Error('Task not found');
    }
  }

  deleteTask(id: number): Observable<void> {
    const index = this.mockTasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.mockTasks.splice(index, 1);
      return of(void 0).pipe(delay(400));
    } else {
      throw new Error('Task not found');
    }
  }

  updateTaskStatus(id: number, status: TaskStatus): Observable<Task> {
    const task = this.mockTasks.find(t => t.id === id);
    if (task) {
      task.status = status;
      task.updatedAt = new Date();
      return of(task).pipe(delay(300));
    } else {
      throw new Error('Task not found');
    }
  }

  assignTask(taskId: number, userId: number): Observable<Task> {
    const task = this.mockTasks.find(t => t.id === taskId);
    if (task) {
      // Mock user assignment
      task.assignee = { id: userId, firstName: 'Assigned', lastName: 'User' } as User;
      task.updatedAt = new Date();
      return of(task).pipe(delay(400));
    } else {
      throw new Error('Task not found');
    }
  }

  addComment(taskId: number, comment: { content: string }): Observable<Task> {
    const task = this.mockTasks.find(t => t.id === taskId);
    if (task) {
      const newComment: Comment = {
        id: task.comments.length + 1,
        content: comment.content,
        author: { id: 1, firstName: 'Current', lastName: 'User' } as User,
        task: task,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      task.comments.push(newComment);
      task.updatedAt = new Date();
      return of(task).pipe(delay(400));
    } else {
      throw new Error('Task not found');
    }
  }

  getTasksByStatus(status: TaskStatus): Observable<Task[]> {
    const tasks = this.mockTasks.filter(task => task.status === status);
    return of(tasks).pipe(delay(500));
  }

  searchTasks(query: string, projectId?: number): Observable<Task[]> {
    let tasks = this.mockTasks;
    
    if (projectId) {
      tasks = tasks.filter(task => task.project.id === projectId);
    }
    
    const searchLower = query.toLowerCase();
    const filtered = tasks.filter(task => 
      task.title.toLowerCase().includes(searchLower) ||
      task.description.toLowerCase().includes(searchLower) ||
      task.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
    
    return of(filtered).pipe(delay(600));
  }
}