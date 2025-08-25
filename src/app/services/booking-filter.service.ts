import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BookingFilterService {
  bookingMode: 'daily' | 'hourly' = 'daily';

  checkInDate?: string;
  checkOutDate?: string;

  bookingDate?: string;
  startTime?: string;
  durationHours: number = 1;

  selectedRoomType: string = '';
  numMembers: number = 1;

  constructor() {}

  setFilters(filters: Partial<BookingFilterService>) {
    Object.assign(this, filters);
  }

  getFilters() {
    return {
      bookingMode: this.bookingMode,
      checkInDate: this.checkInDate,
      checkOutDate: this.checkOutDate,
      bookingDate: this.bookingDate,
      startTime: this.startTime,
      durationHours: this.durationHours,
      selectedRoomType: this.selectedRoomType,
      numMembers: this.numMembers,
    };
  }
}
