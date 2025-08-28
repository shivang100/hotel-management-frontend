import { Component } from '@angular/core';
import { CartService, BookingItem } from '../../services/cart.service';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
})
export class CartComponent {
  items: BookingItem[] = [];

  constructor(
    private cartService: CartService,
    private bookingService: BookingService
  ) {
    this.items = this.cartService.getItems();
  }

  removeItem(i: number) {
    this.cartService.removeItem(i);
    this.items = this.cartService.getItems();
  }

  checkout() {
    for (const item of this.items) {
      this.bookingService
        .createBooking({
          room_id: item.roomId,
          booking_mode: item.bookingMode,
          check_in_date: item.checkInDate,
          check_out_date: item.checkOutDate,
          booking_date: item.bookingDate,
          start_time: item.startTime,
          duration_hours: item.durationHours,
          customer_id: 1, // TODO: replace with logged-in user id
        })
        .subscribe({
          next: (res) => console.log('Booking created', res),
          error: (err) => console.error('Booking failed', err),
        });
    }
    alert('Booking confirmed!');
    this.cartService.clearCart();
    this.items = [];
  }
}
