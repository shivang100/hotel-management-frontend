import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (
      !this.username ||
      !this.email ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.errorMessage = 'Please fill all fields.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.authService
      .register({
        username: this.username,
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.successMessage =
            'Registration successful! Redirecting to login...';
          setTimeout(() => this.router.navigate(['/auth/login']), 2000);
        },
        error: (err) => {
          this.errorMessage = err.error.msg || 'Registration failed.';
        },
      });
  }
}
