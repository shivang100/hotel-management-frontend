import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, BookingItem } from '../../services/cart.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
})
export class PaymentComponent implements OnInit {
  items: BookingItem[] = [];
  paymentDone: boolean = false;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    this.items = this.cartService.getItems();
  }

  getTotalPrice(): number {
    return this.items.reduce((acc, item) => acc + item.price, 0);
  }

  onPay() {
    // Simulate payment success
    this.paymentDone = true;
    // Clear the cart after payment
    this.cartService.clearCart();
  }

  onBackToCart() {
    this.router.navigate(['/customer/bookings']); // Navigate to bookings now
  }
}
