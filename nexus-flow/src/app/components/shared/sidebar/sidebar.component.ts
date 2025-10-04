import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

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

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });
  }

  onToggleSidebar(): void {
    this.sidebarOpen.set(!this.sidebarOpen());
    this.toggleSidebar.emit();
  }

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }
}