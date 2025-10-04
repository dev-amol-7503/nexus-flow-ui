import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Task, TaskStatus, Comment } from '../models/task.model';
import { AuthService } from './auth.service';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly API_URL = 'http://localhost:8080/api/tasks';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders() {
    const token = this.authService.getToken();
    return { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  getTasksByProject(projectId: number): Observable<Task[]> {
    return this.http.get<ApiResponse<Task[]>>(`${this.API_URL}/project/${projectId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error loading project tasks:', error);
        throw error;
      })
    );
  }

  getTasksByUser(userId: number): Observable<Task[]> {
    return this.http.get<ApiResponse<Task[]>>(`${this.API_URL}/user/${userId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error loading user tasks:', error);
        throw error;
      })
    );
  }

  getMyTasks(): Observable<Task[]> {
    return this.http.get<ApiResponse<Task[]>>(`${this.API_URL}/my-tasks`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error loading my tasks:', error);
        throw error;
      })
    );
  }

  getTaskById(id: number): Observable<Task> {
    return this.http.get<ApiResponse<Task>>(`${this.API_URL}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error loading task:', error);
        throw error;
      })
    );
  }

  createTask(task: Partial<Task>): Observable<Task> {
    return this.http.post<ApiResponse<Task>>(this.API_URL, task, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error creating task:', error);
        throw error;
      })
    );
  }

  updateTask(id: number, task: Partial<Task>): Observable<Task> {
    return this.http.put<ApiResponse<Task>>(`${this.API_URL}/${id}`, task, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error updating task:', error);
        throw error;
      })
    );
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error deleting task:', error);
        throw error;
      })
    );
  }

  updateTaskStatus(id: number, status: TaskStatus): Observable<Task> {
    return this.http.patch<ApiResponse<Task>>(
      `${this.API_URL}/${id}/status`,
      { status },
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error updating task status:', error);
        throw error;
      })
    );
  }

  assignTask(taskId: number, userId: number): Observable<Task> {
    return this.http.patch<ApiResponse<Task>>(
      `${this.API_URL}/${taskId}/assign`,
      { userId },
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error assigning task:', error);
        throw error;
      })
    );
  }

  addComment(taskId: number, comment: { content: string }): Observable<Task> {
    return this.http.post<ApiResponse<Task>>(
      `${this.API_URL}/${taskId}/comments`,
      comment,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error adding comment:', error);
        throw error;
      })
    );
  }

  getTasksByStatus(status: TaskStatus): Observable<Task[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<ApiResponse<Task[]>>(`${this.API_URL}/status`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error loading tasks by status:', error);
        throw error;
      })
    );
  }

  searchTasks(query: string, projectId?: number): Observable<Task[]> {
    let params = new HttpParams().set('query', query);
    if (projectId) {
      params = params.set('projectId', projectId.toString());
    }
    
    return this.http.get<ApiResponse<Task[]>>(`${this.API_URL}/search`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error searching tasks:', error);
        throw error;
      })
    );
  }
}