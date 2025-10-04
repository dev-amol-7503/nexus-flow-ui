import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../services/project.service';
import { TaskService } from '../../../services/task.service';
import { Project, Task } from '../../../models';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
  public project = signal<Project | null>(null);
  public tasks = signal<Task[]>([]);
  public isLoading = signal<boolean>(true);
  public activeTab = signal<string>('overview');
  public showTaskForm = signal<boolean>(false);
  
  public newTask = signal<Partial<Task>>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO'
  });

  public priorityOptions = [
    { value: 'LOW', label: 'Low', class: 'priority-low' },
    { value: 'MEDIUM', label: 'Medium', class: 'priority-medium' },
    { value: 'HIGH', label: 'High', class: 'priority-high' },
    { value: 'URGENT', label: 'Urgent', class: 'priority-urgent' }
  ];

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.loadProject();
  }

  loadProject(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.isLoading.set(true);
      
      // Mock data for demonstration
      setTimeout(() => {
        const mockProject: Project = {
          id: +projectId,
          name: 'Website Redesign',
          description: 'Complete redesign of company website with modern UI/UX',
          code: 'WRD-001',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-03-15'),
          budget: 15000,
          owner: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            username: 'john.doe',
            email: 'john.doe@company.com',
            roles: [{ id: 1, name: 'ADMIN', description: 'Administrator' }],
            isActive: true,
            createdAt: new Date('2024-01-01')
          },
          teamMembers: [
            {
              id: 2,
              firstName: 'Jane',
              lastName: 'Smith',
              username: 'jane.smith',
              email: 'jane.smith@company.com',
              roles: [{ id: 2, name: 'PROJECT_MANAGER', description: 'Project Manager' }],
              isActive: true,
              createdAt: new Date('2024-01-02')
            }
          ],
          tasks: [],
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date()
        };
        
        this.project.set(mockProject);
        this.loadProjectTasks(+projectId);
      }, 1000);
    }
  }

  loadProjectTasks(projectId: number): void {
    // Mock tasks data
    const mockTasks: Task[] = [
      {
        id: 1,
        title: 'Create login page design',
        description: 'Design modern login page with responsive layout',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        project: { id: projectId, name: 'Website Redesign' } as any,
        assignee: { 
          id: 2, 
          firstName: 'Jane', 
          lastName: 'Smith' 
        } as any,
        reporter: { 
          id: 1, 
          firstName: 'John', 
          lastName: 'Doe' 
        } as any,
        tags: ['design', 'ui'],
        comments: [],
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date()
      },
      {
        id: 2,
        title: 'Implement user authentication',
        description: 'Set up JWT-based authentication system',
        status: 'TODO',
        priority: 'MEDIUM',
        project: { id: projectId, name: 'Website Redesign' } as any,
        assignee: undefined,
        reporter: { 
          id: 1, 
          firstName: 'John', 
          lastName: 'Doe' 
        } as any,
        tags: ['backend', 'security'],
        comments: [],
        createdAt: new Date('2024-01-21'),
        updatedAt: new Date()
      }
    ];
    
    this.tasks.set(mockTasks);
    this.isLoading.set(false);
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  createTask(): void {
    if (this.newTask().title && this.project()) {
      // Mock task creation
      const newTask: Task = {
        id: this.tasks().length + 1,
        title: this.newTask().title!,
        description: this.newTask().description!,
        status: 'TODO',
        priority: this.newTask().priority!,
        project: this.project()!,
        assignee: undefined,
        reporter: this.project()!.owner,
        tags: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.tasks.update(tasks => [...tasks, newTask]);
      this.showTaskForm.set(false);
      this.newTask.set({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'TODO'
      });
    }
  }

  getProgress(): number {
    const tasks = this.tasks();
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.status === 'DONE').length;
    return Math.round((completedTasks / tasks.length) * 100);
  }

  getCompletedTasksCount(): number {
    return this.tasks().filter(task => task.status === 'DONE').length;
  }

  getInProgressTasksCount(): number {
    return this.tasks().filter(task => task.status === 'IN_PROGRESS').length;
  }

  getTotalTasksCount(): number {
    return this.tasks().length;
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'COMPLETED': 'status-completed',
      'IN_PROGRESS': 'status-in-progress',
      'PLANNING': 'status-planning',
      'ON_HOLD': 'status-on-hold',
      'TODO': 'status-todo',
      'DONE': 'status-done'
    };
    return statusClasses[status] || 'status-default';
  }

  getPriorityClass(priority: string): string {
    const priorityClasses: { [key: string]: string } = {
      'HIGH': 'priority-high',
      'URGENT': 'priority-urgent',
      'MEDIUM': 'priority-medium',
      'LOW': 'priority-low'
    };
    return priorityClasses[priority] || 'priority-default';
  }
}