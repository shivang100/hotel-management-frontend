import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { forkJoin } from 'rxjs';

import { BookingService, Booking } from '../../services/booking.service';
import { RoomService, Room } from '../../services/room.service';
import { ToastService } from 'angular-toastify';

type Status = 'pending' | 'confirmed' | 'cancelled';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  loading = false;

  // KPIs
  totalRooms = 0;
  totalBookings = 0;
  totalCustomers = 0;
  revenueThisMonth = 0;

  // Data
  bookings: Booking[] = [];
  rooms: Room[] = [];
  recentBookings: Booking[] = [];

  // Status counts for small legend under the chart
  statusCounts: Record<Status | string, number> = {
    confirmed: 0,
    pending: 0,
    cancelled: 0,
  };

  // Chart config
  public bookingStatusChartType: 'pie' = 'pie';
  public bookingStatusChartData: ChartData<'pie', number[], string | string[]> =
    {
      labels: ['Confirmed', 'Pending', 'Cancelled'],
      datasets: [
        {
          data: [0, 0, 0],
          backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'], // emerald, amber, red
        },
      ],
    };
  public bookingStatusChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true },
    },
  };

  private firstLoad = true;

  constructor(
    private bookingService: BookingService,
    private roomService: RoomService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    // suppress success toast on first load
    this.refresh(false);
  }

  // Pass showToast=true when user clicks refresh button
  refresh(showToast = true) {
    this.loading = true;
    forkJoin({
      rooms: this.roomService.getRooms(),
      bookings: this.bookingService.getBookings(),
    }).subscribe({
      next: ({ rooms, bookings }) => {
        this.rooms = rooms || [];
        this.bookings = (bookings || []).map((b) => this.enrichBooking(b));
        this.computeKPIs();
        this.computeChart();
        this.recentBookings = this.bookings
          .slice()
          .sort((a, b) => (b.id || 0) - (a.id || 0))
          .slice(0, 5);
        this.loading = false;

        if (!this.firstLoad && showToast) {
          this.toast.success('Dashboard updated');
        }
        this.firstLoad = false;
      },
      error: (err) => {
        console.error('Dashboard load failed', err);
        this.loading = false;
        this.toast.error('Failed to load dashboard data');
      },
    });
  }

  private enrichBooking(b: Booking): Booking {
    const r = this.rooms.find((x) => x.id === b.room_id);
    if (r) {
      (b as any).room_name = r.name;
      (b as any).room_type = r.room_type;
      (b as any).price_per_day = r.price_per_day;
      (b as any).price_per_hour = r.price_per_hour;
    }
    return b;
  }

  private computeKPIs() {
    this.totalRooms = this.rooms.length;
    this.totalBookings = this.bookings.length;

    // Distinct customers
    const seen = new Set(this.bookings.map((b) => String(b.customer_id ?? '')));
    seen.delete('');
    this.totalCustomers = seen.size;

    // Revenue this month from confirmed bookings
    this.revenueThisMonth = this.calcRevenueForCurrentMonth(this.bookings);
  }

  private calcRevenueForCurrentMonth(list: Booking[]): number {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    let sum = 0;
    for (const b of list) {
      if ((b.status || '').toLowerCase() !== 'confirmed') continue;

      const r = this.rooms.find((x) => x.id === b.room_id);
      if (!r) continue;

      if (b.booking_mode === 'daily' && b.check_in_date && b.check_out_date) {
        const ci = new Date(b.check_in_date);
        const co = new Date(b.check_out_date);
        if (ci.getFullYear() === y && ci.getMonth() === m) {
          const nights = Math.max(
            0,
            Math.round((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24))
          );
          sum += nights * (r.price_per_day || 0);
        }
      } else if (
        b.booking_mode === 'hourly' &&
        b.booking_date &&
        b.duration_hours
      ) {
        const d = new Date(b.booking_date);
        if (d.getFullYear() === y && d.getMonth() === m) {
          sum += (b.duration_hours || 0) * (r.price_per_hour || 0);
        }
      }
    }
    return Math.round(sum);
  }

  private computeChart() {
    const confirmed = this.bookings.filter(
      (b) => (b.status || '').toLowerCase() === 'confirmed'
    ).length;
    const pending = this.bookings.filter(
      (b) => (b.status || '').toLowerCase() === 'pending'
    ).length;
    const cancelled = this.bookings.filter(
      (b) => (b.status || '').toLowerCase() === 'cancelled'
    ).length;

    this.statusCounts['confirmed'] = confirmed;
    this.statusCounts['pending'] = pending;
    this.statusCounts['cancelled'] = cancelled;

    this.bookingStatusChartData = {
      labels: ['Confirmed', 'Pending', 'Cancelled'],
      datasets: [
        {
          data: [confirmed, pending, cancelled],
          backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
        },
      ],
    };
  }

  statusBadgeClasses(status?: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'confirmed')
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    if (s === 'pending') return 'bg-amber-50 text-amber-700 ring-amber-200';
    if (s === 'cancelled') return 'bg-rose-50 text-rose-700 ring-rose-200';
    return 'bg-slate-50 text-slate-700 ring-slate-200';
  }

  // ---------- Formatting helpers (for table) ----------
  formatDate(d?: string): string {
    if (!d) return '—';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  }

  formatTime(t?: string): string {
    if (!t) return '—';
    // Expect "HH:mm" or "HH:mm:ss"
    return t.slice(0, 5);
  }

  checkInDisplay(b: Booking): string {
    if (b.booking_mode === 'daily') {
      return this.formatDate(b.check_in_date);
    }
    const date = this.formatDate(b.booking_date);
    const time = this.formatTime(b.start_time);
    if (date === '—' && time === '—') return '—';
    return `${date} · ${time}`;
  }

  checkOutDisplay(b: Booking): string {
    if (b.booking_mode === 'daily') {
      return this.formatDate(b.check_out_date);
    }
    if (!b.booking_date || !b.start_time || !b.duration_hours) return '—';

    const [hh, mm] = b.start_time.split(':').map((n) => parseInt(n, 10) || 0);
    const start = new Date(b.booking_date);
    if (isNaN(start.getTime())) return '—';
    start.setHours(hh, mm, 0, 0);

    const end = new Date(start);
    end.setHours(end.getHours() + (b.duration_hours || 0));

    const date = end.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
    const time = end.toTimeString().slice(0, 5);
    return `${date} · ${time}`;
  }
}
