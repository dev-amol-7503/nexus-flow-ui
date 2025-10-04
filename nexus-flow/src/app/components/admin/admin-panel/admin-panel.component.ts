import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User, Role, RoleName } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
  // Inject AuthService
  private authService = inject(AuthService);

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

  // Available roles with proper typing
  public availableRoles: Role[] = [
    { id: 1, name: 'ADMIN', description: 'System Administrator' },
    { id: 2, name: 'PROJECT_MANAGER', description: 'Project Manager' },
    { id: 3, name: 'TEAM_MEMBER', description: 'Team Member' }
  ];

  public systemStats = signal<any>({
    totalUsers: 0,
    activeUsers: 0,
    totalProjects: 0,
    totalTasks: 0,
    storageUsed: '2.5 GB',
    systemUptime: '99.9%'
  });

  ngOnInit(): void {
    this.loadUsers();
    this.loadSystemStats();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    
    // Use AuthService to get mock users
    const mockUsers = this.authService.getMockUsers();
    
    setTimeout(() => {
      this.users.set(mockUsers);
      this.filteredUsers.set(mockUsers);
      this.isLoading.set(false);
    }, 1000);
  }

  loadSystemStats(): void {
    this.systemStats.set({
      totalUsers: 45,
      activeUsers: 38,
      totalProjects: 12,
      totalTasks: 234,
      storageUsed: '2.5 GB',
      systemUptime: '99.9%'
    });
  }

  // Handle search input
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

  // Get last login text
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
      return lastLogin.toLocaleDateString();
    }
  }

  // Get users count with specific role
  getUsersWithRoleCount(roleName: RoleName): number {
    return this.users().filter(user => 
      user.roles.some(role => role.name === roleName)
    ).length;
  }

  // Update form field
  updateFormField(field: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const currentForm = this.userForm();
    this.userForm.set({
      ...currentForm,
      [field]: input.value
    });
  }

  // Check if form has role
  hasFormRole(roleName: RoleName): boolean {
    const formRoles = this.userForm().roles || [];
    return formRoles.some(role => role.name === roleName);
  }

  // Handle role change in form
  handleRoleChange(role: Role, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const currentForm = this.userForm();
    const currentRoles = [...(currentForm.roles || [])];
    
    if (checkbox.checked) {
      // Add role
      if (!currentRoles.some(r => r.name === role.name)) {
        currentRoles.push(role);
      }
    } else {
      // Remove role
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
    console.log('Saving user:', this.userForm());
    this.closeUserModal();
    this.loadUsers();
  }

  toggleUserStatus(user: User): void {
    user.isActive = !user.isActive;
    console.log('Updated user status:', user);
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
      console.log('Deleting user:', user);
      this.loadUsers();
    }
  }

  toggleUserRole(user: User, role: Role): void {
    const userRoles = user.roles.map(r => r.name);
    if (userRoles.includes(role.name)) {
      user.roles = user.roles.filter(r => r.name !== role.name);
    } else {
      user.roles.push(role);
    }
    console.log('Updated user roles:', user);
  }

  hasRole(user: User, roleName: RoleName): boolean {
    return user.roles.some(role => role.name === roleName);
  }

  getRoleBadgeClass(roleName: RoleName): string {
    const roleClasses: { [key: string]: string } = {
      'ADMIN': 'badge-admin',
      'PROJECT_MANAGER': 'badge-pm',
      'TEAM_MEMBER': 'badge-member'
    };
    return roleClasses[roleName] || 'badge-secondary';
  }
}