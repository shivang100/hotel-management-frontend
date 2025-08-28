import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  onLogin() {
    if (!this.username || !this.password) {
      this.toast.info('Please enter username and password');
      return;
    }

    this.loading = true;
    this.authService
      .login({ username: this.username, password: this.password })
      .subscribe({
        next: (user) => {
          const role = user.role;
          this.toast.success('Logged in successfully');
          if (role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/customer']);
          }
        },
        error: () => {
          this.toast.error('Invalid credentials');
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
