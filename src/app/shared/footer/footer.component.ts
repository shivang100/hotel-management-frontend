import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from 'src/app/services/auth.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
})
export class FooterComponent implements OnInit {
  user: User | null = null;

  // Useful bits for the template
  currentYear = new Date().getFullYear();
  hotelName = 'Green Valley Hotel';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
    });
  }

  // Same logout hook used in the header templates
  onLogout(): void {
    this.authService.logout();
  }

  // Optional helpers (handy for *ngIf in the template)
  get isLoggedIn(): boolean {
    return !!this.user;
  }
  get isCustomer(): boolean {
    return this.user?.role === 'customer';
  }
  get isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  // Optional: quick navigation if you need it in footer links
  goTo(path: string): void {
    this.router.navigate([path]);
  }
}
