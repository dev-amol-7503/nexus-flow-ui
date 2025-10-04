import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RoleName } from '../../../models/user.model';
import { SetupService } from '../../../services/setup.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  public sidebarOpen = signal<boolean>(true);
  public currentUser = signal<any>(null);

  constructor(private setupService: SetupService) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });
  }

  ngOnInit(): void {
   // this.authService.currentUser$.subscribe(user => {
    //  this.currentUser.set(user);
   // });

    // Check if setup is needed (extra safety)
    this.setupService.checkSetupStatus().subscribe({
      next: (status) => {
        if (status.canSetup) {
          this.router.navigate(['/setup']);
        }
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ✅ Update method to use proper role names
  hasRole(role: RoleName): boolean {
    return this.authService.hasRole(role);
  }

  // ✅ Helper method for template to check admin role
  isAdmin(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }

  // ✅ Helper method for template to check project manager role
  isProjectManager(): boolean {
    return this.authService.hasRole('ROLE_PROJECT_MANAGER');
  }

  // ✅ Helper method for template to check team member role
  isTeamMember(): boolean {
    return this.authService.hasRole('ROLE_TEAM_MEMBER');
  }
}