import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SetupService } from './services/setup.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <router-outlet></router-outlet>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'NexusFlow';

  constructor(
    private setupService: SetupService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check setup status on app initialization
    this.checkInitialSetup();
  }

  private checkInitialSetup(): void {
    this.setupService.checkSetupStatus().subscribe({
      next: (status) => {
        if (status.canSetup && this.router.url === '/') {
          // Redirect to setup if needed
          this.router.navigate(['/setup']);
        } else if (!status.canSetup && this.router.url === '/setup') {
          // Redirect away from setup if already configured
          this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        console.error('Failed to check setup status:', error);
        // Default to setup page on error
        if (this.router.url === '/') {
          this.router.navigate(['/setup']);
        }
      }
    });
  }
}