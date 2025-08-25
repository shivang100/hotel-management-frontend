import { Component, OnInit } from '@angular/core';
import { CartService, BookingItem } from '../../services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit {
  items: BookingItem[] = [];

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    this.items = this.cartService.getItems();
  }

  removeItem(index: number) {
    this.cartService.removeItem(index);
    this.items = this.cartService.getItems();
  }

  getTotalPrice(): number {
    return this.items.reduce((acc, item) => acc + item.price, 0);
  }
  goToPayment() {
    this.router.navigate(['/customer/payment']);
  }
}
