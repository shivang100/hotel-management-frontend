import { Component, OnInit } from '@angular/core';
import { BookingService, Booking } from '../../services/booking.service';
import { jsPDF } from 'jspdf';
import { ToastService } from 'angular-toastify';

export type FilterTab =
  | 'all'
  | 'upcoming'
  | 'past'
  | 'confirmed'
  | 'pending'
  | 'cancelled'
  | 'cancellation_requested';

export type SortKey =
  | 'newest'
  | 'oldest'
  | 'checkin_asc'
  | 'checkin_desc'
  | 'room_asc'
  | 'room_desc';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
})
export class BookingsComponent implements OnInit {
  loading = true;
  error = '';
  bookings: Booking[] = [];

  readonly tabs: FilterTab[] = [
    'all',
    'upcoming',
    'past',
    'confirmed',
    'pending',
    'cancellation_requested',
    'cancelled',
  ];

  activeTab: FilterTab = 'all';
  search = '';
  sortBy: SortKey = 'newest';

  // Branding
  private hotelName = 'Green Valley Hotel';
  private hotelLogoUrl = 'assets/logo-green-valley.png';

  constructor(
    private bookingService: BookingService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch() {
    this.loading = true;
    this.error = '';
    this.bookingService.getBookings().subscribe({
      next: (data) => {
        this.bookings = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Could not load your bookings.');
        this.loading = false;
      },
    });
  }

  // ---------- helpers ----------
  private parseISODate(d?: string): Date | null {
    if (!d) return null;
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt;
  }
  private parseHMToDate(baseISO?: string, hm?: string): Date | null {
    const base = this.parseISODate(baseISO);
    if (!base || !hm) return null;
    const [h, m] = hm.split(':').map((x) => parseInt(x, 10) || 0);
    const dt = new Date(base);
    dt.setHours(h, m, 0, 0);
    return dt;
  }
  private addHours(d: Date, hours: number): Date {
    const x = new Date(d);
    x.setHours(x.getHours() + (hours || 0));
    return x;
  }
  private displayDate(dt: Date | null): string {
    if (!dt) return '—';
    return dt.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  }
  private displayTime(dt: Date | null): string {
    if (!dt) return '—';
    const hh = String(dt.getHours()).padStart(2, '0');
    const mm = String(dt.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  private startDate(b: Booking): Date | null {
    if (b.booking_mode === 'daily') return this.parseISODate(b.check_in_date);
    return this.parseHMToDate(b.booking_date, b.start_time);
  }
  private endDate(b: Booking): Date | null {
    if (b.booking_mode === 'daily') return this.parseISODate(b.check_out_date);
    const start = this.startDate(b);
    if (!start) return this.parseISODate(b.booking_date) ?? null;
    return this.addHours(start, b.duration_hours || 0);
  }
  private isPast(b: Booking): boolean {
    const end = this.endDate(b);
    return !!end && end < new Date();
  }
  private isUpcoming(b: Booking): boolean {
    const start = this.startDate(b);
    return !!start && start >= new Date();
  }

  checkInDisplay(b: Booking): string {
    if (b.booking_mode === 'daily') {
      return this.displayDate(this.parseISODate(b.check_in_date));
    }
    const start = this.startDate(b);
    return `${this.displayDate(start)} · ${this.displayTime(start)}`;
  }
  checkOutDisplay(b: Booking): string {
    if (b.booking_mode === 'daily') {
      return this.displayDate(this.parseISODate(b.check_out_date));
    }
    const end = this.endDate(b);
    return `${this.displayDate(end)} · ${this.displayTime(end)}`;
  }

  // ---------- filtering/sorting ----------
  get view(): Booking[] {
    let list = [...this.bookings];

    switch (this.activeTab) {
      case 'upcoming':
        list = list.filter((b) => this.isUpcoming(b));
        break;
      case 'past':
        list = list.filter((b) => this.isPast(b));
        break;
      case 'confirmed':
      case 'pending':
      case 'cancelled':
      case 'cancellation_requested':
        list = list.filter(
          (b) => (b.status || '').toLowerCase() === this.activeTab
        );
        break;
    }

    const q = this.search.trim().toLowerCase();
    if (q) {
      list = list.filter((b) => {
        const name = (b.room_name || '').toLowerCase();
        const type = (b.room_type || '').toLowerCase();
        const idStr = String(b.id || '');
        const status = (b.status || '').toLowerCase();
        return (
          name.includes(q) ||
          type.includes(q) ||
          idStr.includes(q) ||
          status.includes(q)
        );
      });
    }

    list.sort((a, b) => {
      const aStart = this.startDate(a)?.getTime() || 0;
      const bStart = this.startDate(b)?.getTime() || 0;
      const aName = (a.room_name || '').toLowerCase();
      const bName = (b.room_name || '').toLowerCase();
      switch (this.sortBy) {
        case 'newest':
          return (b.id || 0) - (a.id || 0);
        case 'oldest':
          return (a.id || 0) - (b.id || 0);
        case 'checkin_asc':
          return aStart - bStart;
        case 'checkin_desc':
          return bStart - aStart;
        case 'room_asc':
          return aName.localeCompare(bName);
        case 'room_desc':
          return bName.localeCompare(aName);
        default:
          return 0;
      }
    });

    return list;
  }

  // ---------- PDF ----------
  private safe(s?: any) {
    return s === undefined || s === null || s === '' ? '—' : String(s);
  }
  private fmtDate(d?: string | null) {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString();
  }
  private loadImageAsDataURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Canvas unsupported');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject('Image load failed');
      img.src = url;
    });
  }

  async downloadPDF(b: Booking) {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 36;
      let y = margin;

      // Header bar
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, pageW, 70, 'F');

      // Logo + hotel name
      try {
        const logoData = await this.loadImageAsDataURL(this.hotelLogoUrl);
        doc.addImage(logoData, 'PNG', margin, 16, 42, 42);
      } catch {}
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text(this.hotelName, margin + 54, 42);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Booking Confirmation', margin + 54, 58);

      y = 90;
      doc.setDrawColor(16, 185, 129);
      doc.line(margin, y, pageW - margin, y);
      y += 20;

      // Booking details
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.text('Booking Details', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);

      const gap = 18;
      y += gap;
      doc.text(`Booking ID: ${this.safe(b.id)}`, margin, y);
      y += gap;
      doc.text(`Status: ${this.safe(b.status)}`, margin, y);
      y += gap;
      doc.text(`Mode: ${this.safe(b.booking_mode)}`, margin, y);

      // Room
      y += gap * 2;
      doc.setFont('helvetica', 'bold');
      doc.text('Room', margin, y);
      y += gap;
      doc.setFont('helvetica', 'normal');
      doc.text(`Room: ${this.safe(b.room_name)}`, margin, y);
      y += gap;
      if (b.room_type) doc.text(`Type: ${this.safe(b.room_type)}`, margin, y);
      y += gap;
      if (b.booking_mode === 'daily') {
        doc.text(`Check-in: ${this.fmtDate(b.check_in_date)}`, margin, y);
        y += gap;
        doc.text(`Check-out: ${this.fmtDate(b.check_out_date)}`, margin, y);
      } else {
        doc.text(`Date: ${this.fmtDate(b.booking_date)}`, margin, y);
        y += gap;
        doc.text(`Start: ${this.safe(b.start_time)}`, margin, y);
        y += gap;
        doc.text(`Duration: ${this.safe(b.duration_hours)} hours`, margin, y);
      }

      // Footer
      doc.setFontSize(10);
      y = 760;
      doc.setTextColor(100, 116, 139);
      doc.text(
        'This is your booking confirmation. Please contact reception for any changes.',
        margin,
        y
      );
      y += 14;
      doc.text(
        'Contact: +91-00000-00000 · reservations@greenvalley.example',
        margin,
        y
      );
      y += 20;
      doc.setTextColor(148, 163, 184);
      doc.text(
        `${this.hotelName} · Generated on ${new Date().toLocaleString()}`,
        margin,
        y
      );

      doc.save(`Booking_${b.id}.pdf`);
      this.toast.success('PDF generated');
    } catch (err) {
      console.error(err);
      this.toast.error('Failed to generate PDF');
    }
  }

  // ---------- status + actions ----------
  badgeClass(status?: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'confirmed')
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s === 'cancelled') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (s === 'cancellation_requested')
      return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  }

  canRequestCancel(b: Booking): boolean {
    const s = (b.status || '').toLowerCase();
    return s === 'confirmed' || s === 'pending';
  }

  requestCancel(b: Booking) {
    if (!this.canRequestCancel(b)) return;
    this.bookingService
      .updateBooking(b.id!, { status: 'cancellation_requested' })
      .subscribe({
        next: (updated) => {
          this.bookings = this.bookings.map((x) =>
            x.id === updated.id ? updated : x
          );
          this.toast.success(
            `Cancellation requested for booking #${updated.id}`
          );
        },
        error: (err) => {
          console.error(err);
          this.toast.error('Could not request cancellation.');
        },
      });
  }
}
