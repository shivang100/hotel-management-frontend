import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-room-detail',
  templateUrl: './room-detail.component.html',
})
export class RoomDetailComponent implements OnInit {
  roomId?: number;
  room?: any;
  bookingFilters: any = {};

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

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.roomId = Number(this.route.snapshot.paramMap.get('id'));
    this.room = this.rooms.find((r) => r.id === this.roomId);

    this.route.queryParams.subscribe((params) => {
      this.bookingFilters = params;
    });
  }

  bookRoom() {
    this.router.navigate(['/customer/booking', this.roomId], {
      queryParams: this.bookingFilters,
    });
  }
}
