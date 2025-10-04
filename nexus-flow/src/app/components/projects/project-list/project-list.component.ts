import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../services/project.service';
import { Project, ProjectStatus, Priority } from '../../../models/project.model';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
  public projects = signal<Project[]>([]);
  public filteredProjects = signal<Project[]>([]);
  public isLoading = signal<boolean>(true);
  public searchTerm = signal<string>('');
  public statusFilter = signal<ProjectStatus | 'ALL'>('ALL');
  public priorityFilter = signal<Priority | 'ALL'>('ALL');
  
  public currentPage = signal<number>(0);
  public pageSize = signal<number>(10);
  public totalItems = signal<number>(0);
  public totalPages = signal<number>(0);

  public statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'PLANNING', label: 'Planning' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'ON_HOLD', label: 'On Hold' },
    { value: 'COMPLETED', label: 'Completed' }
  ];

  public priorityOptions = [
    { value: 'ALL', label: 'All Priority' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' }
  ];

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading.set(true);
    this.projectService.getAllProjects(this.currentPage(), this.pageSize(), 'createdAt,desc')
      .subscribe({
        next: (response) => {
          this.projects.set(response.content);
          this.filteredProjects.set(response.content);
          this.totalItems.set(response.totalElements);
          this.totalPages.set(response.totalPages);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading projects:', error);
          this.isLoading.set(false);
        }
      });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onPriorityFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.projects();

    if (this.searchTerm()) {
      const searchLower = this.searchTerm().toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.code.toLowerCase().includes(searchLower)
      );
    }

    if (this.statusFilter() !== 'ALL') {
      filtered = filtered.filter(project => project.status === this.statusFilter());
    }

    if (this.priorityFilter() !== 'ALL') {
      filtered = filtered.filter(project => project.priority === this.priorityFilter());
    }

    this.filteredProjects.set(filtered);
  }

  // Add missing method
  clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('ALL');
    this.priorityFilter.set('ALL');
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadProjects();
  }

  getStatusClass(status: ProjectStatus): string {
    const statusClasses: { [key: string]: string } = {
      'COMPLETED': 'status-completed',
      'IN_PROGRESS': 'status-in-progress',
      'PLANNING': 'status-planning',
      'ON_HOLD': 'status-on-hold'
    };
    return statusClasses[status] || 'status-default';
  }

  getPriorityClass(priority: Priority): string {
    const priorityClasses: { [key: string]: string } = {
      'HIGH': 'priority-high',
      'URGENT': 'priority-urgent',
      'MEDIUM': 'priority-medium',
      'LOW': 'priority-low'
    };
    return priorityClasses[priority] || 'priority-default';
  }

  getProgress(project: Project): number {
    const totalTasks = project.tasks.length;
    if (totalTasks === 0) return 0;
    
    const completedTasks = project.tasks.filter((task: any) => task.status === 'DONE').length;
    return Math.round((completedTasks / totalTasks) * 100);
  }

  deleteProject(projectId: number): void {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService.deleteProject(projectId).subscribe({
        next: () => {
          this.loadProjects();
        },
        error: (error) => {
          console.error('Error deleting project:', error);
        }
      });
    }
  }
}