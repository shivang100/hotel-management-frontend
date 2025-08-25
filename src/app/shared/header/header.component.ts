import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // Adjust path accordingly

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  userRole: 'admin' | 'customer' | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole(); // This should return 'admin' or 'customer'
  }
}
