import { Component, OnInit } from '@angular/core';
import { CartService, BookingItem } from '../../services/cart.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
})
export class BookingsComponent implements OnInit {
  bookings: BookingItem[] = [];

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    // For now, simulate bookings stored elsewhere or reuse cart items
    this.bookings = []; // Replace with real bookings API integration
  }
}
