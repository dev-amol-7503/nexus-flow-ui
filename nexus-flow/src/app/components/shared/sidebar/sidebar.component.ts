import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RoleName } from '../../../models/user.model'; // ✅ Import RoleName type

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  public sidebarOpen = signal<boolean>(true);
  public currentUser = signal<any>(null);
  
  toggleSidebar = output<void>();

  // ✅ Role constants for template use
  public readonly ROLES = {
    ADMIN: 'ROLE_ADMIN' as RoleName,
    PROJECT_MANAGER: 'ROLE_PROJECT_MANAGER' as RoleName,
    TEAM_MEMBER: 'ROLE_TEAM_MEMBER' as RoleName
  };

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });
  }

  onToggleSidebar(): void {
    this.sidebarOpen.set(!this.sidebarOpen());
    this.toggleSidebar.emit();
  }

  // ✅ Update method to accept RoleName
  hasRole(role: RoleName): boolean {
    return this.authService.hasRole(role);
  }

  // ✅ Helper methods for common role checks
  isAdmin(): boolean {
    return this.authService.hasRole(this.ROLES.ADMIN);
  }

  isProjectManager(): boolean {
    return this.authService.hasRole(this.ROLES.PROJECT_MANAGER);
  }

  isTeamMember(): boolean {
    return this.authService.hasRole(this.ROLES.TEAM_MEMBER);
  }
}