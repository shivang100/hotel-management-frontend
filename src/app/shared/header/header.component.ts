import { Component, OnInit, HostListener } from '@angular/core'; // ← add HostListener
import { Router } from '@angular/router';
import { AuthService, User } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  user: User | null = null;

  // --- ADDED: state for scroll effects ---// switches to compact style after 12px
  showHeader = true; // auto-hide on scroll down
  private lastY = 0; // track scroll direction
  private revealThreshold = 12;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
    });
  }

  // --- ADDED: scroll listener to animate header ---
  isScrolled = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const y = window.scrollY || 0;
    this.isScrolled = y > this.revealThreshold;

    // reveal when scrolling up, hide when scrolling down (after a tiny threshold)
    const goingDown = y > this.lastY + 2;
    const goingUp = y < this.lastY - 2;

    if (goingDown && y > 64) this.showHeader = false;
    if (goingUp) this.showHeader = true;

    this.lastY = y;
  }

  onLogout() {
    this.authService.logout();
  }
  goHome() {
    if (this.authService.isLoggedIn()) {
      const role = this.authService.getUserRole();
      if (role === 'admin') {
        this.router.navigate(['/admin']);
      } else if (role === 'customer') {
        this.router.navigate(['/customer']);
      } else {
        this.router.navigate(['/login']); // fallback
      }
    } else {
      this.router.navigate(['/login']);
    }
  }
}
