import { Component, OnInit } from '@angular/core';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  editMode = false;

  profile = {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    address: '',
    city: '',
    state: '',
    postalCode: '',
  };

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    // Optionally load from backend or localStorage here
  }

  onEdit() {
    this.editMode = true;
  }

  onCancel() {
    this.editMode = false;
    // Optionally reload profile to discard changes
  }

  onSave() {
    if (!this.profile.fullName || !this.profile.email || !this.profile.phone) {
      this.toastService.error('Full Name, Email, and Phone are required.');
      return;
    }
    // Save to backend or localStorage here

    this.editMode = false;
    this.toastService.success('Profile saved successfully.');
  }
}
