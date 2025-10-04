import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { Project, ProjectStatus, Priority } from '../models/project.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly API_URL = 'http://localhost:8080/api/projects';

  // Mock projects data
  private mockProjects: Project[] = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete redesign of company website with modern UI/UX',
      code: 'WRD-001',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-15'),
      budget: 15000,
      owner: { id: 1, firstName: 'System', lastName: 'Administrator', username: 'admin', email: 'admin@nexusflow.com', roles: [], isActive: true, createdAt: new Date() } as User,
      teamMembers: [
        { id: 2, firstName: 'Project', lastName: 'Manager', username: 'manager', email: 'manager@nexusflow.com', roles: [], isActive: true, createdAt: new Date() } as User,
        { id: 3, firstName: 'Team', lastName: 'Member', username: 'user', email: 'user@nexusflow.com', roles: [], isActive: true, createdAt: new Date() } as User
      ],
      tasks: [
        { id: 1, title: 'Design Homepage', status: 'DONE', priority: 'HIGH' } as any,
        { id: 2, title: 'Implement Login', status: 'IN_PROGRESS', priority: 'MEDIUM' } as any,
        { id: 3, title: 'Mobile Responsive', status: 'TODO', priority: 'HIGH' } as any
      ],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'Develop cross-platform mobile application for iOS and Android',
      code: 'MAD-001',
      status: 'PLANNING',
      priority: 'URGENT',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-06-01'),
      budget: 50000,
      owner: { id: 2, firstName: 'Project', lastName: 'Manager', username: 'manager', email: 'manager@nexusflow.com', roles: [], isActive: true, createdAt: new Date() } as User,
      teamMembers: [
        { id: 3, firstName: 'Team', lastName: 'Member', username: 'user', email: 'user@nexusflow.com', roles: [], isActive: true, createdAt: new Date() } as User
      ],
      tasks: [
        { id: 4, title: 'UI Design', status: 'TODO', priority: 'HIGH' } as any,
        { id: 5, title: 'Backend API', status: 'TODO', priority: 'MEDIUM' } as any
      ],
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-25')
    },
    {
      id: 3,
      name: 'Database Migration',
      description: 'Migrate from legacy database to modern cloud solution',
      code: 'DBM-001',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      startDate: new Date('2023-11-01'),
      endDate: new Date('2024-01-15'),
      budget: 25000,
      owner: { id: 1, firstName: 'System', lastName: 'Administrator', username: 'admin', email: 'admin@nexusflow.com', roles: [], isActive: true, createdAt: new Date() } as User,
      teamMembers: [
        { id: 2, firstName: 'Project', lastName: 'Manager', username: 'manager', email: 'manager@nexusflow.com', roles: [], isActive: true, createdAt: new Date() } as User
      ],
      tasks: [
        { id: 6, title: 'Data Backup', status: 'DONE', priority: 'HIGH' } as any,
        { id: 7, title: 'Schema Migration', status: 'DONE', priority: 'MEDIUM' } as any,
        { id: 8, title: 'Testing', status: 'DONE', priority: 'LOW' } as any
      ],
      createdAt: new Date('2023-10-15'),
      updatedAt: new Date('2024-01-15')
    }
  ];

  constructor(private http: HttpClient) {}

  getAllProjects(page: number = 0, size: number = 10, sort: string = 'name'): Observable<any> {
    // Mock pagination
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedProjects = this.mockProjects.slice(startIndex, endIndex);

    const mockResponse = {
      content: paginatedProjects,
      totalElements: this.mockProjects.length,
      totalPages: Math.ceil(this.mockProjects.length / size),
      size: size,
      number: page
    };

    return of(mockResponse).pipe(delay(800));
  }

  getProjectById(id: number): Observable<Project> {
    const project = this.mockProjects.find(p => p.id === id);
    if (project) {
      return of(project).pipe(delay(500));
    } else {
      throw new Error('Project not found');
    }
  }

  createProject(project: Partial<Project>): Observable<Project> {
    const newProject: Project = {
      id: this.mockProjects.length + 1,
      name: project.name || 'New Project',
      description: project.description || '',
      code: `PROJ-${this.mockProjects.length + 1}`,
      status: project.status || 'PLANNING',
      priority: project.priority || 'MEDIUM',
      startDate: project.startDate || new Date(),
      endDate: project.endDate,
      budget: project.budget,
      owner: project.owner || { id: 1, firstName: 'System', lastName: 'Administrator' } as User,
      teamMembers: project.teamMembers || [],
      tasks: project.tasks || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mockProjects.push(newProject);
    return of(newProject).pipe(delay(800));
  }

  updateProject(id: number, project: Partial<Project>): Observable<Project> {
    const index = this.mockProjects.findIndex(p => p.id === id);
    if (index !== -1) {
      this.mockProjects[index] = { ...this.mockProjects[index], ...project, updatedAt: new Date() };
      return of(this.mockProjects[index]).pipe(delay(600));
    } else {
      throw new Error('Project not found');
    }
  }

  deleteProject(id: number): Observable<void> {
    const index = this.mockProjects.findIndex(p => p.id === id);
    if (index !== -1) {
      this.mockProjects.splice(index, 1);
      return of(void 0).pipe(delay(500));
    } else {
      throw new Error('Project not found');
    }
  }

  getProjectsByStatus(status: ProjectStatus): Observable<Project[]> {
    const filtered = this.mockProjects.filter(p => p.status === status);
    return of(filtered).pipe(delay(500));
  }

  addTeamMember(projectId: number, userId: number): Observable<Project> {
    const project = this.mockProjects.find(p => p.id === projectId);
    if (project) {
      // Mock user - in real app, you'd fetch the user
      const user = { id: userId, firstName: 'New', lastName: 'Member' } as User;
      if (!project.teamMembers.find(m => m.id === userId)) {
        project.teamMembers.push(user);
      }
      return of(project).pipe(delay(500));
    } else {
      throw new Error('Project not found');
    }
  }

  removeTeamMember(projectId: number, userId: number): Observable<Project> {
    const project = this.mockProjects.find(p => p.id === projectId);
    if (project) {
      project.teamMembers = project.teamMembers.filter(m => m.id !== userId);
      return of(project).pipe(delay(500));
    } else {
      throw new Error('Project not found');
    }
  }

  getProjectStatistics(): Observable<any> {
    const stats = {
      totalProjects: this.mockProjects.length,
      completedTasks: this.mockProjects.reduce((acc, project) => 
        acc + project.tasks.filter(task => task.status === 'DONE').length, 0),
      pendingTasks: this.mockProjects.reduce((acc, project) => 
        acc + project.tasks.filter(task => task.status !== 'DONE').length, 0),
      teamMembers: new Set(this.mockProjects.flatMap(p => p.teamMembers.map(m => m.id))).size
    };

    return of(stats).pipe(delay(600));
  }
}