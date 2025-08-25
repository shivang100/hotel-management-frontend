import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingFilterService } from '../../services/booking-filter.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  bookingMode: 'daily' | 'hourly' = 'daily';

  checkInDate?: string;
  checkOutDate?: string;

  bookingDate?: string;
  startTime?: string;
  durationHours: number = 1;

  selectedRoomType: string = '';
  numMembers: number = 1;

  featuredRooms = [
    {
      id: 1,
      name: 'Standard Room',
      description: 'Comfortable room with basic amenities.',
      pricePerDay: 100,
    },
    {
      id: 2,
      name: 'Deluxe Room',
      description: 'Larger room with premium facilities.',
      pricePerDay: 180,
    },
    {
      id: 3,
      name: 'Suite',
      description: 'Luxury suite with separate living area.',
      pricePerDay: 300,
    },
  ];

  constructor(
    private router: Router,
    private filterService: BookingFilterService
  ) {}

  ngOnInit(): void {}

  onSearchRooms() {
    if (this.bookingMode === 'daily') {
      if (!this.checkInDate || !this.checkOutDate) {
        alert('Please select check-in and check-out dates');
        return;
      }
      if (new Date(this.checkInDate) > new Date(this.checkOutDate)) {
        alert('Check-out date must be after check-in date');
        return;
      }
    } else {
      if (!this.bookingDate || !this.startTime || this.durationHours < 1) {
        alert('Please fill all hourly booking details');
        return;
      }
    }

    // Save filters to service
    this.filterService.setFilters({
      bookingMode: this.bookingMode,
      checkInDate: this.checkInDate,
      checkOutDate: this.checkOutDate,
      bookingDate: this.bookingDate,
      startTime: this.startTime,
      durationHours: this.durationHours,
      selectedRoomType: this.selectedRoomType,
      numMembers: this.numMembers,
    });

    // Navigate to room catalog
    this.router.navigate(['/customer/rooms']);
  }
}
