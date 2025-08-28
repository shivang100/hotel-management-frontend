import { Component, OnInit } from '@angular/core';
import { ToastService } from 'angular-toastify';

interface AdminProfile {
  fullName: string;
  email: string;
  phone?: string;
  title?: string;
  bio?: string;
  avatar?: string; // base64 preview for demo
}

const LS_KEY = 'admin_profile_demo';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
})
export class AdminProfileComponent implements OnInit {
  profile: AdminProfile = {
    fullName: 'Admin User',
    email: 'admin@example.com',
    phone: '',
    title: 'Administrator',
    bio: '',
    avatar: '',
  };

  editMode = false;
  saving = false;

  constructor(private toast: ToastService) {}

  ngOnInit(): void {
    // Load from localStorage (demo). Replace with API GET if needed.
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        this.profile = {
          ...this.profile,
          ...(JSON.parse(raw) as AdminProfile),
        };
      } catch {}
    }
  }

  onEdit() {
    this.editMode = true;
  }

  onCancel() {
    // Reload persisted to discard changes (demo)
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        this.profile = JSON.parse(raw) as AdminProfile;
      } catch {}
    }
    this.editMode = false;
  }

  onSave() {
    if (!this.profile.fullName?.trim() || !this.profile.email?.trim()) {
      this.toast.error('Full Name and Email are required');
      return;
    }
    this.saving = true;

    // For demo, persist locally. Replace with your API POST/PUT.
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(this.profile));
      this.toast.success('Profile updated successfully');
      this.editMode = false;
    } catch {
      this.toast.error('Failed to save profile locally');
    } finally {
      this.saving = false;
    }
  }

  onAvatarSelected(evt: Event) {
    const file = (evt.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.profile.avatar = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeAvatar() {
    this.profile.avatar = '';
  }
}
