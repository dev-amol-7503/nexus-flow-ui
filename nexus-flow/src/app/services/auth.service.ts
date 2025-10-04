import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap, delay } from 'rxjs';
import { User, Role, RoleName } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  public isAuthenticated = signal<boolean>(false);
  public userRoles = signal<RoleName[]>([]);

  // Helper function to create roles with proper typing
  private createRole(id: number, name: RoleName, description: string): Role {
    return { id, name, description };
  }

  // Mock users for demonstration with proper typing
  private mockUsers: User[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@nexusflow.com',
      firstName: 'System',
      lastName: 'Administrator',
      avatar: 'assets/images/default-avatar.png',
      roles: [this.createRole(1, 'ADMIN', 'System Administrator')],
      isActive: true,
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date()
    },
    {
      id: 2,
      username: 'manager',
      email: 'manager@nexusflow.com',
      firstName: 'Project',
      lastName: 'Manager',
      avatar: 'assets/images/default-avatar.png',
      roles: [this.createRole(2, 'PROJECT_MANAGER', 'Project Manager')],
      isActive: true,
      createdAt: new Date('2024-01-15'),
      lastLogin: new Date()
    },
    {
      id: 3,
      username: 'user',
      email: 'user@nexusflow.com',
      firstName: 'Team',
      lastName: 'Member',
      avatar: 'assets/images/default-avatar.png',
      roles: [this.createRole(3, 'TEAM_MEMBER', 'Team Member')],
      isActive: true,
      createdAt: new Date('2024-02-01'),
      lastLogin: new Date()
    }
  ];

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
      this.userRoles.set(userObj.roles.map(role => role.name));
    }
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    const user = this.mockUsers.find(u => u.username === credentials.username);
    
    if (user) {
      const mockResponse = {
        accessToken: 'mock-jwt-token-' + user.id,
        user: user
      };

      return of(mockResponse).pipe(
        delay(1000),
        tap(response => {
          localStorage.setItem('access_token', response.accessToken);
          localStorage.setItem('current_user', JSON.stringify(response.user));
          this.isAuthenticated.set(true);
          this.currentUserSubject.next(response.user);
          this.userRoles.set(response.user.roles.map(role => role.name));
        })
      );
    } else {
      return of(null).pipe(
        delay(1000),
        tap(() => {
          throw new Error('Invalid username or password');
        })
      );
    }
  }

  register(userData: any): Observable<any> {
    const newUser: User = {
      id: this.mockUsers.length + 1,
      ...userData,
      avatar: 'assets/images/default-avatar.png',
      roles: [this.createRole(3, 'TEAM_MEMBER', 'Team Member')],
      isActive: true,
      createdAt: new Date(),
      lastLogin: new Date()
    };

    this.mockUsers.push(newUser);

    return of({
      message: 'User registered successfully',
      user: newUser
    }).pipe(delay(1000));
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
    return this.isAuthenticated();
  }

  hasRole(role: RoleName): boolean {
    return this.userRoles().includes(role);
  }

  hasAnyRole(roles: RoleName[]): boolean {
    return roles.some(role => this.userRoles().includes(role));
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  refreshToken(): Observable<any> {
    return of({ accessToken: 'mock-refreshed-token' }).pipe(delay(500));
  }

  // Helper method to get mock users for admin panel
  getMockUsers(): User[] {
    return this.mockUsers;
  }
}