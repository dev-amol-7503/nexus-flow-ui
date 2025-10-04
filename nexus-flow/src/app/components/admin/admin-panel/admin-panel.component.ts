import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User, Role, RoleName } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  public activeTab = signal<string>('users');
  public users = signal<User[]>([]);
  public filteredUsers = signal<User[]>([]);
  public isLoading = signal<boolean>(true);
  public searchTerm = signal<string>('');
  
  public selectedUser = signal<User | null>(null);
  public showUserModal = signal<boolean>(false);
  public userForm = signal<Partial<User>>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    roles: []
  });

  public availableRoles: Role[] = [
    { id: 1, name: 'ROLE_ADMIN', description: 'System Administrator' },
    { id: 2, name: 'ROLE_PROJECT_MANAGER', description: 'Project Manager' },
    { id: 3, name: 'ROLE_TEAM_MEMBER', description: 'Team Member' }
  ];

  public systemStats = signal<any>({
    totalUsers: 0,
    activeUsers: 0,
    totalProjects: 0,
    totalTasks: 0,
    storageUsed: '0 GB',
    systemUptime: '100%'
  });

  private readonly API_URL = 'http://localhost:8080/api/admin';

  ngOnInit(): void {
    this.loadUsers();
    this.loadSystemStats();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadUsers(): void {
    this.isLoading.set(true);
    
    this.http.get<ApiResponse<User[]>>(`${this.API_URL}/users`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.users.set(response.data);
          this.filteredUsers.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading.set(false);
      }
    });
  }

  loadSystemStats(): void {
    this.http.get<ApiResponse<any>>(`${this.API_URL}/stats`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.systemStats.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  handleSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.onSearchChange();
  }

  onSearchChange(): void {
    const searchLower = this.searchTerm().toLowerCase();
    if (!searchLower) {
      this.filteredUsers.set(this.users());
    } else {
      const filtered = this.users().filter(user =>
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower)
      );
      this.filteredUsers.set(filtered);
    }
  }

  getLastLoginText(lastLogin?: Date): string {
    if (!lastLogin) return 'Never';
    
    const now = new Date();
    const diffTime = now.getTime() - new Date(lastLogin).getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      return new Date(lastLogin).toLocaleDateString();
    }
  }

  getUsersWithRoleCount(roleName: RoleName): number {
    return this.users().filter(user => 
      user.roles.some(role => role.name === roleName)
    ).length;
  }

  updateFormField(field: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const currentForm = this.userForm();
    this.userForm.set({
      ...currentForm,
      [field]: input.value
    });
  }

  hasFormRole(roleName: RoleName): boolean {
    const formRoles = this.userForm().roles || [];
    return formRoles.some(role => role.name === roleName);
  }

  handleRoleChange(role: Role, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const currentForm = this.userForm();
    const currentRoles = [...(currentForm.roles || [])];
    
    if (checkbox.checked) {
      if (!currentRoles.some(r => r.name === role.name)) {
        currentRoles.push(role);
      }
    } else {
      const index = currentRoles.findIndex(r => r.name === role.name);
      if (index > -1) {
        currentRoles.splice(index, 1);
      }
    }
    
    this.userForm.set({
      ...currentForm,
      roles: currentRoles
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  openUserModal(user?: User): void {
    if (user) {
      this.selectedUser.set(user);
      this.userForm.set({ ...user });
    } else {
      this.selectedUser.set(null);
      this.userForm.set({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        roles: []
      });
    }
    this.showUserModal.set(true);
  }

  closeUserModal(): void {
    this.showUserModal.set(false);
    this.selectedUser.set(null);
  }

  saveUser(): void {
    const userData = this.userForm();
    
    if (this.selectedUser()) {
      this.http.put<ApiResponse<User>>(
        `${this.API_URL}/users/${this.selectedUser()?.id}`,
        userData,
        { headers: this.getAuthHeaders() }
      ).subscribe({
        next: (response) => {
          if (response.success) {
            this.closeUserModal();
            this.loadUsers();
          }
        },
        error: (error) => {
          console.error('Error updating user:', error);
        }
      });
    } else {
      this.http.post<ApiResponse<User>>(
        `${this.API_URL}/users`,
        userData,
        { headers: this.getAuthHeaders() }
      ).subscribe({
        next: (response) => {
          if (response.success) {
            this.closeUserModal();
            this.loadUsers();
          }
        },
        error: (error) => {
          console.error('Error creating user:', error);
        }
      });
    }
  }

  toggleUserStatus(user: User): void {
    this.http.patch<ApiResponse<User>>(
      `${this.API_URL}/users/${user.id}/toggle-status`,
      {},
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadUsers();
        }
      },
      error: (error) => {
        console.error('Error updating user status:', error);
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
      this.http.delete<ApiResponse<void>>(
        `${this.API_URL}/users/${user.id}`,
        { headers: this.getAuthHeaders() }
      ).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadUsers();
          }
        },
        error: (error) => {
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  getRoleBadgeClass(roleName: RoleName): string {
    const roleClasses: { [key: string]: string } = {
      'ROLE_ADMIN': 'badge-danger',
      'ROLE_PROJECT_MANAGER': 'badge-warning',
      'ROLE_TEAM_MEMBER': 'badge-info'
    };
    return roleClasses[roleName] || 'badge-secondary';
  }
}