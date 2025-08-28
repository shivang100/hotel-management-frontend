import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService, Room } from '../../services/room.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-room-detail',
  templateUrl: './room-detail.component.html',
})
export class RoomDetailComponent implements OnInit {
  room!: Room;
  activeImage = '';

  // booking controls
  bookingMode: 'daily' | 'hourly' = 'daily';
  checkInDate?: string;
  checkOutDate?: string;

  bookingDate?: string;
  startTime?: string;
  durationHours = 1;
  numMembers = 1;

  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService,
    private cart: CartService,
    private toast: ToastService // ✅ inject toast
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/customer/rooms']);
      return;
    }

    this.loading = true;
    this.roomService.getRoom(id).subscribe({
      next: (r) => {
        this.room = r;
        this.activeImage = r.main_image || 'assets/room-placeholder.jpg';
        this.loading = false;
      },
      error: (e) => {
        console.error(e);
        this.toast.error('❌ Failed to load room');
        this.loading = false;
      },
    });
  }

  // --- image ---
  setActive(img: string) {
    this.activeImage = img;
  }

  // --- date helpers ---
  private toDateStr(d: Date): string {
    return d.toISOString().slice(0, 10);
  }
  get todayStr(): string {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return this.toDateStr(d);
  }
  get checkoutMinDate(): string {
    if (this.checkInDate) {
      const ci = new Date(this.checkInDate);
      ci.setDate(ci.getDate() + 1); // must be > check-in
      return this.toDateStr(ci);
    }
    const t = new Date(this.todayStr);
    t.setDate(t.getDate() + 1);
    return this.toDateStr(t);
  }

  // --- price / total ---
  priceLabel(): string {
    if (!this.room) return '';
    return this.bookingMode === 'daily'
      ? `₹${this.room.price_per_day} / day`
      : `₹${this.room.price_per_hour} / hour`;
  }

  private nights(ci: string, co: string): number {
    const start = new Date(ci);
    const end = new Date(co);
    const ms = end.getTime() - start.getTime();
    return ms > 0 ? Math.ceil(ms / (1000 * 60 * 60 * 24)) : 0;
  }

  estimatedTotal(): number | null {
    if (!this.room) return null;
    if (this.bookingMode === 'daily') {
      if (this.checkInDate && this.checkOutDate) {
        const n = this.nights(this.checkInDate, this.checkOutDate);
        return n > 0 ? n * this.room.price_per_day : null;
      }
      return null;
    } else {
      if (this.bookingDate && this.startTime && this.durationHours >= 1) {
        return this.durationHours * this.room.price_per_hour;
      }
      return null;
    }
  }

  // --- add to cart w/ validations identical to dashboard rules ---
  goToPayment() {
    // capacity
    if (this.numMembers > 2) {
      this.toast.warn('⚠️ Maximum capacity per room is 2');
      return;
    }

    // validations
    if (this.bookingMode === 'daily') {
      if (!this.checkInDate || !this.checkOutDate) {
        this.toast.error('Please select check-in and check-out dates');
        return;
      }
      const ci = new Date(this.checkInDate);
      const co = new Date(this.checkOutDate);
      const today = new Date(this.todayStr);
      if (ci < today) {
        this.toast.error('Check-in cannot be before today');
        return;
      }
      if (co <= ci) {
        this.toast.error('Check-out must be at least one day after check-in');
        return;
      }
      if (this.toDateStr(co) === this.todayStr) {
        this.toast.error('Check-out cannot be today');
        return;
      }
    } else {
      if (!this.bookingDate || !this.startTime || this.durationHours < 1) {
        this.toast.error('Please fill all hourly booking details');
        return;
      }
      const bd = new Date(this.bookingDate);
      const today = new Date(this.todayStr);
      if (bd < today) {
        this.toast.error('Booking date cannot be before today');
        return;
      }
    }

    // compute amount
    let amount = 0;
    if (this.bookingMode === 'daily') {
      const nights =
        this.checkInDate && this.checkOutDate
          ? Math.max(
              1,
              Math.ceil(
                (new Date(this.checkOutDate).getTime() -
                  new Date(this.checkInDate).getTime()) /
                  86400000
              )
            )
          : 1;
      amount = nights * this.room.price_per_day;
    } else {
      amount = Math.max(1, this.durationHours) * this.room.price_per_hour;
    }

    this.toast.success('✅ Proceeding to payment');

    this.router.navigate(['/customer/payment'], {
      state: {
        roomId: this.room.id,
        roomName: this.room.name,
        mainImage: this.room.main_image,
        bookingMode: this.bookingMode,
        checkInDate: this.checkInDate,
        checkOutDate: this.checkOutDate,
        bookingDate: this.bookingDate,
        startTime: this.startTime,
        durationHours: this.durationHours,
        numMembers: this.numMembers,
        amount,
      },
    });
  }
}
