import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { Project, Task } from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public stats = signal<any>(null);
  public recentProjects = signal<Project[]>([]);
  public myTasks = signal<Task[]>([]);
  public isLoading = signal<boolean>(true);

  constructor(
    private projectService: ProjectService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);

    // Load mock data for demonstration
    setTimeout(() => {
      this.stats.set({
        totalProjects: 8,
        completedTasks: 45,
        pendingTasks: 12,
        teamMembers: 6
      });

      this.recentProjects.set([
        {
          id: 1,
          name: 'Website Redesign',
          description: 'Complete redesign of company website',
          code: 'WRD-001',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-03-15'),
          budget: 15000,
          owner: { id: 1, firstName: 'John', lastName: 'Doe' } as any,
          teamMembers: [],
          tasks: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ] as Project[]);

      this.myTasks.set([
        {
          id: 1,
          title: 'Create login page design',
          description: 'Design modern login page with responsive layout',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          project: { id: 1, name: 'Website Redesign' } as any,
          assignee: { id: 1, firstName: 'You' } as any,
          reporter: { id: 2, firstName: 'PM' } as any,
          tags: [],
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ] as Task[]);

      this.isLoading.set(false);
    }, 1000);
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

  toggleTask(task: Task): void {
    // Implement task toggle functionality
    console.log('Toggle task:', task);
  }

  isOverdue(dueDate: Date): boolean {
    return new Date(dueDate) < new Date();
  }
}