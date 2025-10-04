import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Project, ProjectStatus, Priority } from '../models/project.model';
import { AuthService } from './auth.service';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly API_URL = 'http://localhost:8080/api/projects';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders() {
    const token = this.authService.getToken();
    return { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  getAllProjects(page: number = 0, size: number = 10, sort: string = 'createdAt,desc'): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<ApiResponse<any>>(this.API_URL, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error loading projects:', error);
        throw error;
      })
    );
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<ApiResponse<Project>>(`${this.API_URL}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error loading project:', error);
        throw error;
      })
    );
  }

  createProject(project: Partial<Project>): Observable<Project> {
    return this.http.post<ApiResponse<Project>>(this.API_URL, project, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error creating project:', error);
        throw error;
      })
    );
  }

  updateProject(id: number, project: Partial<Project>): Observable<Project> {
    return this.http.put<ApiResponse<Project>>(`${this.API_URL}/${id}`, project, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error updating project:', error);
        throw error;
      })
    );
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error deleting project:', error);
        throw error;
      })
    );
  }

  getProjectsByStatus(status: ProjectStatus): Observable<Project[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<ApiResponse<Project[]>>(`${this.API_URL}/status`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error loading projects by status:', error);
        throw error;
      })
    );
  }

  addTeamMember(projectId: number, userId: number): Observable<Project> {
    return this.http.post<ApiResponse<Project>>(
      `${this.API_URL}/${projectId}/team-members`,
      { userId },
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error adding team member:', error);
        throw error;
      })
    );
  }

  removeTeamMember(projectId: number, userId: number): Observable<Project> {
    return this.http.delete<ApiResponse<Project>>(
      `${this.API_URL}/${projectId}/team-members/${userId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error removing team member:', error);
        throw error;
      })
    );
  }

  getProjectStatistics(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/statistics`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error loading project statistics:', error);
        throw error;
      })
    );
  }
}