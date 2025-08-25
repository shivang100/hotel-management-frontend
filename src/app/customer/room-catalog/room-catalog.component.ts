import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingFilterService } from '../../services/booking-filter.service';

@Component({
  selector: 'app-room-catalog',
  templateUrl: './room-catalog.component.html',
})
export class RoomCatalogComponent implements OnInit {
  rooms = [
    {
      id: 1,
      name: 'Standard Room',
      description: 'Comfortable room with basic amenities.',
      pricePerDay: 100,
      pricePerHour: 15,
    },
    {
      id: 2,
      name: 'Deluxe Room',
      description: 'Larger room with premium facilities.',
      pricePerDay: 180,
      pricePerHour: 25,
    },
    {
      id: 3,
      name: 'Suite',
      description: 'Luxury suite with separate living area.',
      pricePerDay: 300,
      pricePerHour: 40,
    },
  ];

  bookingFilters: any = {};
  searchText: string = '';
  selectedPriceFilter: string = '';
  constructor(
    private router: Router,
    private filterService: BookingFilterService
  ) {}

  ngOnInit(): void {
    this.bookingFilters = this.filterService.getFilters();
  }
  filteredRooms() {
    return this.rooms.filter((room) => {
      const matchesSearch = room.name
        .toLowerCase()
        .includes(this.searchText.toLowerCase());

      let matchesPrice = true;
      if (this.selectedPriceFilter === 'low') {
        matchesPrice = room.pricePerDay < 150;
      } else if (this.selectedPriceFilter === 'medium') {
        matchesPrice = room.pricePerDay >= 150 && room.pricePerDay <= 250;
      } else if (this.selectedPriceFilter === 'high') {
        matchesPrice = room.pricePerDay > 250;
      }

      return matchesSearch && matchesPrice;
    });
  }

  viewRoomDetails(room: any) {
    this.router.navigate(['/customer/rooms', room.id], {
      queryParams: this.bookingFilters,
    });
  }
}
