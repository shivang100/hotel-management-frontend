import { Component, OnInit } from '@angular/core';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
})
export class AdminProfileComponent implements OnInit {
  profile = {
    fullName: 'Admin User',
    email: 'admin@example.com',
    phone: '',
    // add more fields if needed
  };

  editMode = false;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    // Load profile from backend or localStorage
    // For now, using preset data
  }

  onEdit() {
    this.editMode = true;
  }

  onCancel() {
    this.editMode = false;
    // Optionally reload profile data
  }

  onSave() {
    if (!this.profile.fullName || !this.profile.email) {
      this.toastService.error('Full Name and Email are required');
      return;
    }
    // Save profile data to backend or localStorage here
    this.toastService.success('Profile updated successfully');
    this.editMode = false;
  }
}
