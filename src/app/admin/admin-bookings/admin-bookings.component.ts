import { Component, OnInit } from '@angular/core';
import { jsPDF } from 'jspdf';
import { ToastService } from 'angular-toastify';
import { BookingService, Booking } from '../../services/booking.service';

type Status = 'pending' | 'confirmed' | 'cancelled' | 'cancellation_requested';

@Component({
  selector: 'app-admin-bookings',
  templateUrl: './admin-bookings.component.html',
})
export class AdminBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  loading = false;

  statusFilter: '' | Status = '';
  searchTerm = '';
  actionLoading: Record<number, boolean> = {};

  // Confirm modal
  showConfirm = false;
  confirmText = '';
  confirmAction: (() => void) | null = null;

  readonly AUTO_PURGE_ON_CANCEL = false;

  // --- Letterhead configuration ---
  private hotelName = 'Green Valley Hotel';
  // Put your real logo file under /assets/ — keep it same-origin to avoid CORS issues
  private hotelLogoUrl = 'assets/logo-green-valley.png';

  constructor(
    private toast: ToastService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings() {
    this.loading = true;
    this.bookingService.getBookings().subscribe({
      next: (res) => {
        this.bookings = res || [];
        this.loading = false;
      },
      error: () => {
        this.toast.error('Could not load bookings');
        this.loading = false;
      },
    });
  }

  filtered(): Booking[] {
    let list = [...this.bookings];

    if (this.statusFilter) {
      const wanted = this.statusFilter.toLowerCase();
      list = list.filter((b) => (b.status || '').toLowerCase() === wanted);
    }

    const q = this.searchTerm.trim().toLowerCase();
    if (q) {
      list = list.filter((b) => {
        const id = String(b.id ?? '');
        const rid = String(b.room_id ?? '');
        const cid = String(b.customer_id ?? '');
        const mode = (b.booking_mode || '').toLowerCase();
        const status = (b.status || '').toLowerCase();
        const name = ((b as any).room_name || '').toLowerCase();
        const type = ((b as any).room_type || '').toLowerCase();
        return (
          id.includes(q) ||
          rid.includes(q) ||
          cid.includes(q) ||
          mode.includes(q) ||
          status.includes(q) ||
          name.includes(q) ||
          type.includes(q)
        );
      });
    }

    list.sort((a, b) => (b.id || 0) - (a.id || 0));
    return list;
  }

  statusBadgeClasses(status?: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'confirmed')
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    if (s === 'pending') return 'bg-amber-50 text-amber-700 ring-amber-200';
    if (s === 'cancelled') return 'bg-rose-50 text-rose-700 ring-rose-200';
    if (s === 'cancellation_requested')
      return 'bg-blue-50 text-blue-700 ring-blue-200';
    return 'bg-slate-50 text-slate-700 ring-slate-200';
  }

  isCancellationRequested(b: Booking) {
    return (b.status || '').toLowerCase() === 'cancellation_requested';
  }

  updateStatus(b: Booking, status: Status) {
    if (!b.id) return;
    this.actionLoading[b.id] = true;

    this.bookingService.updateBooking(b.id, { status }).subscribe({
      next: (updated) => {
        this.bookings = this.bookings.map((x) =>
          x.id === updated.id ? updated : x
        );
        this.toast.success(`Booking #${updated.id} marked ${status}`);
      },
      error: () => this.toast.error('Failed to update status'),
      complete: () => {
        if (b.id) delete this.actionLoading[b.id];
      },
    });
  }

  approveCancellation(b: Booking) {
    this.updateStatus(b, 'cancelled');
  }

  keepBooking(b: Booking) {
    this.updateStatus(b, 'confirmed');
  }

  askConfirm(text: string, action: () => void) {
    this.confirmText = text;
    this.confirmAction = action;
    this.showConfirm = true;
    this.toast.info('⚠️ Confirmation required');
  }

  runConfirm() {
    if (this.confirmAction) this.confirmAction();
    this.closeConfirm();
  }

  closeConfirm() {
    this.showConfirm = false;
    this.confirmText = '';
    this.confirmAction = null;
  }

  deleteBooking(b: Booking) {
    if (!b.id) return;
    this.askConfirm(`Delete booking #${b.id}? This cannot be undone.`, () =>
      this.deleteBookingInternal(b, true)
    );
  }

  private async deleteBookingInternal(b: Booking, toast = true) {
    if (!b.id) return;
    this.actionLoading[b.id] = true;

    const prev = [...this.bookings];
    this.bookings = this.bookings.filter((x) => x.id !== b.id);

    this.bookingService.deleteBooking(b.id).subscribe({
      next: () => {
        if (toast) this.toast.success(`Booking #${b.id} deleted`);
      },
      error: (err) => {
        console.error('Delete failed', err);
        this.bookings = prev; // revert
        this.toast.error('Failed to delete booking');
      },
      complete: () => {
        if (b.id) delete this.actionLoading[b.id];
      },
    });
  }

  // ---------- PDF ----------
  /**
   * Loads an image URL and returns a dataURL string (base64) suitable for jsPDF.addImage.
   * Must be same-origin (e.g., assets/) or have proper CORS headers.
   */
  private loadImageAsDataURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!url) return reject('No URL');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('Canvas unsupported');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject('Image load failed');
      img.src = url;
    });
  }

  private fmtDate(d?: string | null) {
    if (!d) return '—';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString();
  }

  private safe(s?: any) {
    return s === undefined || s === null || s === '' ? '—' : String(s);
  }

  /**
   * Builds a premium-looking PDF with letterhead, sections, and (if available) images.
   */
  async downloadBookingPDF(b: Booking) {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' }); // 595 x 842 pt
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 36; // 0.5in
      let y = margin;

      // --- Letterhead ---
      // Top bar
      doc.setFillColor(16, 185, 129); // emerald-500
      doc.rect(0, 0, pageW, 70, 'F');

      // Logo (optional)
      try {
        const logoData = this.hotelLogoUrl
          ? await this.loadImageAsDataURL(this.hotelLogoUrl)
          : '';
        if (logoData) {
          doc.addImage(logoData, 'PNG', margin, 16, 42, 42); // square logo
        }
      } catch {
        // ignore logo failures
      }

      // Hotel name
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text(this.hotelName, margin + 54, 42);

      // Subheading
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Booking Confirmation / Invoice', margin + 54, 58);

      y = 90;

      // Header divider
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(1);
      doc.line(margin, y, pageW - margin, y);
      y += 16;

      // --- Booking Summary ---
      const leftCol = margin;
      const rightCol = pageW / 2 + 8;

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFontSize(14);
      doc.text('Booking Details', leftCol, y);
      y += 10;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const lineGap = 18;

      doc.text(`Booking ID: ${this.safe(b.id)}`, leftCol, (y += lineGap));
      doc.text(`Status: ${this.safe(b.status)}`, leftCol, (y += lineGap));
      doc.text(
        `Mode: ${this.safe((b.booking_mode || '').toUpperCase())}`,
        leftCol,
        (y += lineGap)
      );

      // Room & dates on right half
      let ry = y - lineGap * 2;
      doc.setFont('helvetica', 'bold');
      doc.text('Room Summary', rightCol, ry);
      ry += 10;
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Room: ${
          this.safe((b as any).room_name) || 'Room #' + this.safe(b.room_id)
        }`,
        rightCol,
        (ry += lineGap)
      );
      if ((b as any).room_type) {
        doc.text(
          `Type: ${this.safe((b as any).room_type)}`,
          rightCol,
          (ry += lineGap)
        );
      }

      if (b.booking_mode === 'daily') {
        doc.text(
          `Check-in: ${this.fmtDate(b.check_in_date)}`,
          rightCol,
          (ry += lineGap)
        );
        doc.text(
          `Check-out: ${this.fmtDate(b.check_out_date)}`,
          rightCol,
          (ry += lineGap)
        );
      } else {
        doc.text(
          `Date: ${this.fmtDate(b.booking_date)}`,
          rightCol,
          (ry += lineGap)
        );
        doc.text(
          `Start: ${this.safe(b.start_time)}`,
          rightCol,
          (ry += lineGap)
        );
        doc.text(
          `Duration: ${this.safe(b.duration_hours)} hour(s)`,
          rightCol,
          (ry += lineGap)
        );
      }

      y = Math.max(y, ry) + 16;

      // section divider
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageW - margin, y);
      y += 16;

      // --- Guest / Billing (if present) ---
      // These fields match your earlier additions: bill_full_name, bill_email, bill_phone, bill_gstin, bill_address1, bill_address2, bill_city, bill_state, bill_postal_code, bill_country
      const billing: Record<string, any> = {
        Name: (b as any).bill_full_name,
        Email: (b as any).bill_email,
        Phone: (b as any).bill_phone,
        GSTIN: (b as any).bill_gstin,
        Address: [(b as any).bill_address1, (b as any).bill_address2]
          .filter(Boolean)
          .join(', '),
        City: (b as any).bill_city,
        State: (b as any).bill_state,
        'Postal Code': (b as any).bill_postal_code,
        Country: (b as any).bill_country,
      };

      const hasBilling = Object.values(billing).some((v) => !!v);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.text('Guest / Billing', leftCol, y);
      y += 10;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);

      if (hasBilling) {
        const keys = Object.keys(billing);
        const colGap = 210;
        const rowGap = 18;
        let bx = leftCol;
        let by = y;

        keys.forEach((label, idx) => {
          const value = this.safe(billing[label]);
          const labelText = `${label}:`;
          doc.setFont('helvetica', 'bold');
          doc.text(labelText, bx, by);
          const labelWidth = doc.getTextWidth(labelText + ' ');
          doc.setFont('helvetica', 'normal');
          doc.text(String(value), bx + labelWidth + 2, by);

          if ((idx + 1) % 4 === 0) {
            by = y;
            bx += colGap;
          } else {
            by += rowGap;
          }
        });

        y = Math.max(y + Math.ceil(keys.length / 4) * rowGap, by) + 12;
      } else {
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text('No billing details provided.', leftCol, y);
        y += 12;
        doc.setTextColor(15, 23, 42);
      }

      // divider
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageW - margin, y);
      y += 16;

      // --- Optional Room Image (right) ---
      // Try to display room_main_image if available & same-origin
      let roomImgAdded = false;
      try {
        const imgUrl = (b as any).room_main_image as string;
        if (imgUrl) {
          const dataUrl = await this.loadImageAsDataURL(imgUrl);
          const imgW = 180;
          const imgH = 120;
          doc.setFont('helvetica', 'bold');
          doc.text('Room Photo', rightCol, y);
          doc.addImage(
            dataUrl,
            'PNG',
            rightCol,
            y + 8,
            imgW,
            imgH,
            undefined,
            'FAST'
          );
          roomImgAdded = true;
        }
      } catch {
        // ignore image errors
      }

      // --- Notes / Footer ---
      const footerY = roomImgAdded ? y + 140 : y + 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(
        'This document serves as a booking confirmation receipt. Please contact the front desk for any changes.',
        margin,
        footerY
      );

      // Contact line
      doc.text(
        'Contact: +91-00000-00000 · reservations@greenvalley.example',
        margin,
        footerY + 14
      );

      // Page footer line
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, 820, pageW - margin, 820);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(
        `${this.hotelName} · Generated on ${new Date().toLocaleString()}`,
        margin,
        835
      );

      // Save
      const filename = `Booking_${b.id ?? 'NA'}.pdf`;
      doc.save(filename);
      this.toast.success('PDF generated');
    } catch (err) {
      console.error(err);
      this.toast.error('Failed to generate PDF');
    }
  }

  get counts(): {
    confirmed: number;
    pending: number;
    cancelled: number;
    cancellation_requested: number;
  } {
    const m = {
      confirmed: 0,
      pending: 0,
      cancelled: 0,
      cancellation_requested: 0,
    };
    for (const b of this.bookings) {
      const s = (b.status || '').toLowerCase();
      if (s in m) (m as any)[s] = (m as any)[s] + 1;
    }
    return m;
  }
}
