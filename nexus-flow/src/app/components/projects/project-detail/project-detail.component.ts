import { Component, OnInit, signal, inject } from '@angular/core';
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
  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);
  private taskService = inject(TaskService);

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

  ngOnInit(): void {
    this.loadProject();
  }

  loadProject(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.isLoading.set(true);
      
      this.projectService.getProjectById(+projectId).subscribe({
        next: (project) => {
          this.project.set(project);
          this.loadProjectTasks(+projectId);
        },
        error: (error) => {
          console.error('Error loading project:', error);
          this.isLoading.set(false);
        }
      });
    }
  }

  loadProjectTasks(projectId: number): void {
    this.taskService.getTasksByProject(projectId).subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading.set(false);
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  createTask(): void {
    if (this.newTask().title && this.project()) {
      const taskData = {
        ...this.newTask(),
        projectId: this.project()!.id
      };

      this.taskService.createTask(taskData).subscribe({
        next: (task) => {
          this.tasks.update(tasks => [...tasks, task]);
          this.showTaskForm.set(false);
          this.newTask.set({
            title: '',
            description: '',
            priority: 'MEDIUM',
            status: 'TODO'
          });
        },
        error: (error) => {
          console.error('Error creating task:', error);
        }
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