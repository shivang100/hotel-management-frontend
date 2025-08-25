import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private router: Router) {}

  onLogin() {
    // For now, add a simple dummy login logic
    if (this.username && this.password) {
      if (this.username === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/customer']);
      }
    } else {
      alert('Please enter username and password');
    }
  }
}
