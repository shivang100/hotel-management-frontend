import { Injectable } from '@angular/core';

export interface BookingItem {
  roomId: number;
  roomName: string;
  bookingMode: 'daily' | 'hourly';
  checkInDate?: string;
  checkOutDate?: string;
  bookingDate?: string;
  startTime?: string;
  durationHours?: number;
  numMembers: number;
  price: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private items: BookingItem[] = [];

  addItem(item: BookingItem) {
    this.items.push(item);
  }

  getItems(): BookingItem[] {
    return this.items;
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  clearCart() {
    this.items = [];
  }
}
