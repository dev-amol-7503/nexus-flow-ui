import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { User, Role, RoleName } from '../models/user.model';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  statusCode: number;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  public isAuthenticated = signal<boolean>(false);
  public userRoles = signal<RoleName[]>([]);

  constructor(private http: HttpClient) {
    this.checkInitialAuthState();
  }

  private checkInitialAuthState(): void {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('current_user');
    
    if (token && user) {
      this.isAuthenticated.set(true);
      const userObj: User = JSON.parse(user);
      this.currentUserSubject.next(userObj);
      this.userRoles.set(userObj.roles.map(role => role.name as RoleName));
    }
  }

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.API_URL}/login`, credentials)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Login failed');
        }),
        tap(loginResponse => {
          const user: User = {
            id: loginResponse.id,
            username: loginResponse.username,
            email: loginResponse.email,
            firstName: loginResponse.firstName,
            lastName: loginResponse.lastName,
            roles: loginResponse.roles,
            isActive: true,
            avatar: '',
            createdAt: new Date(),
            updatedAt: new Date()
          };

          localStorage.setItem('access_token', loginResponse.accessToken);
          localStorage.setItem('current_user', JSON.stringify(user));
          this.isAuthenticated.set(true);
          this.currentUserSubject.next(user);
          this.userRoles.set(loginResponse.roles.map(role => role.name as RoleName));
        }),
        catchError(error => {
          let errorMessage = 'Login failed';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  register(registerRequest: RegisterRequest): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.API_URL}/register`, registerRequest)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          }
          throw new Error(response.message || 'Registration failed');
        }),
        catchError(error => {
          let errorMessage = 'Registration failed';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  getCurrentUser(): Observable<User> {
    const token = this.getToken();
    if (!token) {
        return throwError(() => new Error('No authentication token found'));
    }

    const headers = { 'Authorization': `Bearer ${token}` };

    return this.http.get<ApiResponse<User>>(`${this.API_URL}/auth/me`, { headers })
        .pipe(
            map(response => {
                if (response.success && response.data) {
                    const processedUser = response.data;
                    localStorage.setItem('current_user', JSON.stringify(processedUser));
                    this.currentUserSubject.next(processedUser);
                    this.userRoles.set(processedUser.roles.map(role => role.name as RoleName));
                    return processedUser;
                }
                throw new Error(response.message || 'Failed to get user data');
            }),
            catchError(error => {
                console.error('Get current user error:', error);
                if (error.status === 401) {
                    this.logout();
                }
                return throwError(() => new Error('Failed to get user data'));
            })
        );
}

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    this.isAuthenticated.set(false);
    this.currentUserSubject.next(null);
    this.userRoles.set([]);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  checkAuthentication(): boolean {
    const token = this.getToken();
    const user = localStorage.getItem('current_user');
    
    if (token && user) {
      this.isAuthenticated.set(true);
      return true;
    }
    
    this.isAuthenticated.set(false);
    return false;
  }

  hasRole(role: RoleName): boolean {
    return this.userRoles().includes(role);
  }

  hasAnyRole(roles: RoleName[]): boolean {
    return roles.some(role => this.userRoles().includes(role));
  }
}