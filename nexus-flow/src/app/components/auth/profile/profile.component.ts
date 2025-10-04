import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

// User profile component for managing personal information
// Backend Note: Requires user profile update endpoint
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  public user = signal<User | null>(null);
  public isLoading = signal<boolean>(true);
  public isEditing = signal<boolean>(false);
  public successMessage = signal<string>('');

 profileForm!: FormGroup;

constructor(
  private authService: AuthService,
  private fb: FormBuilder
) {
  this.profileForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required]],
    phone: [''],
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
          username: user.username
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
    this.loadUserProfile(); // Reset form
  }

  onSave(): void {
    if (this.profileForm.valid) {
      this.isLoading.set(true);
      
      // Backend Note: Update user profile via API
      setTimeout(() => {
        this.successMessage.set('Profile updated successfully!');
        this.isEditing.set(false);
        this.isLoading.set(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage.set('');
        }, 3000);
      }, 1000);
    }
  }

  changePassword(): void {
    // Backend Note: Implement password change functionality
    alert('Password change functionality to be implemented');
  }
}