import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  initials = 'U';
  joinedDate = '-';
  lastLogin = '-';

  prefs = {
    emailNotifications: true,
    smsAlerts: false,
    darkMode: false,
  };

  constructor(
    private auth: AuthService,
    private toast: ToastService // ✅ inject toast
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUser();
    this.initials = this.makeInitials(
      this.user?.username || this.user?.email || 'U'
    );

    const storedJoined = localStorage.getItem('joined_at');
    if (!storedJoined) {
      const now = new Date().toISOString();
      localStorage.setItem('joined_at', now);
      this.joinedDate = this.formatDate(now);
    } else {
      this.joinedDate = this.formatDate(storedJoined);
    }

    const last = localStorage.getItem('last_login_at');
    if (last) this.lastLogin = this.formatDateTime(last);

    const saved = localStorage.getItem('profile_prefs');
    if (saved) {
      try {
        this.prefs = { ...this.prefs, ...JSON.parse(saved) };
      } catch {}
    }
  }

  savePrefs() {
    localStorage.setItem('profile_prefs', JSON.stringify(this.prefs));
    this.toast.success('✅ Preferences saved'); // ✅ toast instead of alert
  }

  logout() {
    this.auth.logout();
    this.toast.info('👋 Logged out'); // ✅ feedback
  }

  logoutOthers() {
    // placeholder for API call to revoke other sessions
    this.toast.warn('⚠️ Other sessions logged out (demo)'); // ✅ toast instead of alert
  }

  // -------- helpers --------
  private makeInitials(text: string) {
    return (
      text
        .split(/\s+|@/)
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0].toUpperCase())
        .join('') || 'U'
    );
  }

  private formatDate(iso?: string) {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  }

  private formatDateTime(iso?: string) {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
