import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SetupService, SetupStatus, SetupAdminRequest, SetupResponse } from '../../services/setup.service';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit {
  public isLoading = signal<boolean>(true);
  public isSubmitting = signal<boolean>(false);
  public errorMessage = signal<string>('');
  public successMessage = signal<string>('');

  public setupForm: FormGroup;

  constructor(
    public setupService: SetupService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.setupForm = this.createForm();
  }

  ngOnInit(): void {
    this.checkSetupStatus();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      invitationCode: ['', [Validators.required, Validators.minLength(3)]],
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
  }

  checkSetupStatus(): void {
    this.setupService.checkSetupStatus().subscribe({
      next: (status: SetupStatus) => {
        this.isLoading.set(false);
        if (!status.canSetup) {
          // If setup is not needed, redirect to login
          this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set('Failed to check setup status. Please try again.');
        console.error('Setup status check failed:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.setupForm.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      const formData: SetupAdminRequest = {
        invitationCode: this.setupForm.value.invitationCode,
        firstName: this.setupForm.value.firstName,
        lastName: this.setupForm.value.lastName,
        username: this.setupForm.value.username,
        email: this.setupForm.value.email,
        password: this.setupForm.value.password
      };

      this.setupService.createFirstAdmin(formData).subscribe({
        next: (response: SetupResponse) => {
          if (response.success) {
            this.successMessage.set(response.message);
            this.isSubmitting.set(false);
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.errorMessage.set(response.message);
            this.isSubmitting.set(false);
          }
        },
        error: (error) => {
          this.isSubmitting.set(false);
          
          // Handle different types of error responses
          if (error.error && error.error.message) {
            this.errorMessage.set(error.error.message);
          } else if (error.error && typeof error.error === 'string') {
            this.errorMessage.set(error.error);
          } else {
            this.errorMessage.set('Failed to create admin account. Please try again.');
          }
          
          console.error('Setup failed:', error);
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.setupForm.controls).forEach(key => {
        const control = this.setupForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  // Form control getters for template
  get invitationCode() { return this.setupForm.get('invitationCode'); }
  get firstName() { return this.setupForm.get('firstName'); }
  get lastName() { return this.setupForm.get('lastName'); }
  get username() { return this.setupForm.get('username'); }
  get email() { return this.setupForm.get('email'); }
  get password() { return this.setupForm.get('password'); }
  get confirmPassword() { return this.setupForm.get('confirmPassword'); }
}