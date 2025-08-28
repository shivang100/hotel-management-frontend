import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { CartService, BookingItem } from '../../services/cart.service';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
})
export class BookingComponent {
  items: BookingItem[] = [];
  placing = false;

  constructor(
    private cart: CartService,
    private bookingService: BookingService,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.items = this.cart.getItems();
  }

  get total(): number {
    return this.items.reduce((sum, i) => sum + (i.price || 0), 0);
  }

  async proceedToPayment() {
    if (!this.items.length) {
      this.toast.warn('Cart is empty');
      return;
    }

    this.placing = true;

    // Show loading toast (will auto-close after default time)
    this.toast.info('⏳ Creating bookings, please wait...');

    const customerId = this.auth.getUserId() ?? undefined;

    try {
      const created = await Promise.all(
        this.items.map((i) =>
          firstValueFrom(
            this.bookingService.createBooking({
              room_id: i.roomId,
              booking_mode: i.bookingMode,
              check_in_date: i.checkInDate,
              check_out_date: i.checkOutDate,
              booking_date: i.bookingDate,
              start_time: i.startTime,
              duration_hours: i.durationHours,
              status: 'pending',
              customer_id: customerId,
            })
          )
        )
      );

      const bookingIds = created
        .map((b) => b?.id)
        .filter((id): id is number => typeof id === 'number');

      if (!bookingIds.length) {
        this.toast.error('❌ Failed to create bookings.');
        return;
      }

      this.router.navigate(['/customer/payment'], {
        state: { bookingIds, amount: this.total },
      });

      this.toast.success('✅ Bookings created. Redirecting to payment...');
    } catch (err) {
      console.error(err);
      this.toast.error('❌ Could not create bookings.');
    } finally {
      this.placing = false;
    }
  }
}
