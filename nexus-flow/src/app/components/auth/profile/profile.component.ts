import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  public user = signal<User | null>(null);
  public isLoading = signal<boolean>(true);
  public isEditing = signal<boolean>(false);
  public successMessage = signal<string>('');

  profileForm!: FormGroup;
  private readonly API_URL = 'http://localhost:8080/api/profile';

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      bio: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user.set(user);
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          bio: user.bio || ''
        });
        this.isLoading.set(false);
      }
    });
  }

  onEdit(): void {
    this.isEditing.set(true);
  }

  onCancel(): void {
    this.isEditing.set(false);
    this.loadUserProfile();
  }

  onSave(): void {
    if (this.profileForm.valid && this.user()) {
      this.isLoading.set(true);
      
      const token = this.authService.getToken();
      const headers = { 'Authorization': `Bearer ${token}` };

      this.http.put<any>(`${this.API_URL}`, this.profileForm.value, { headers })
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.successMessage.set('Profile updated successfully!');
              this.isEditing.set(false);
              
              const updatedUser = { ...this.user(), ...this.profileForm.value };
              this.user.set(updatedUser);
              localStorage.setItem('current_user', JSON.stringify(updatedUser));
              this.authService.getCurrentUser().subscribe();
              
              setTimeout(() => {
                this.successMessage.set('');
              }, 3000);
            }
            this.isLoading.set(false);
          },
          error: (error) => {
            console.error('Error updating profile:', error);
            this.isLoading.set(false);
          }
        });
    }
  }

  changePassword(): void {
    alert('Password change functionality to be implemented');
  }
}