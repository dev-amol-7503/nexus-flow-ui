import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';

interface DashboardStats {
  totalProjects: number;
  completedTasks: number;
  pendingTasks: number;
  teamMembers: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private projectService = inject(ProjectService);
  private taskService = inject(TaskService);
  private authService = inject(AuthService);

  public stats = signal<DashboardStats>({
    totalProjects: 0,
    completedTasks: 0,
    pendingTasks: 0,
    teamMembers: 0
  });
  public recentProjects = signal<any[]>([]);
  public myTasks = signal<any[]>([]);
  public isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);

    this.projectService.getProjectStatistics().subscribe({
      next: (stats) => {
        this.stats.set(stats);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });

    this.projectService.getAllProjects(0, 5).subscribe({
      next: (response) => {
        this.recentProjects.set(response.content || []);
      },
      error: (error) => {
        console.error('Error loading projects:', error);
      }
    });

    this.taskService.getMyTasks().subscribe({
      next: (tasks) => {
        this.myTasks.set(tasks);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading.set(false);
      }
    });
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

  toggleTask(task: any): void {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    this.taskService.updateTaskStatus(task.id, newStatus).subscribe({
      next: (updatedTask) => {
        this.loadDashboardData();
      },
      error: (error) => {
        console.error('Error updating task:', error);
      }
    });
  }

  isOverdue(dueDate: Date): boolean {
    return new Date(dueDate) < new Date();
  }
}