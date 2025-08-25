import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // Adjust path if needed

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
})
export class FooterComponent implements OnInit {
  userRole: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // this.userRole = this.authService.getUserRole();
  }
}
