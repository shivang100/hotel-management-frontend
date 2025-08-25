import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ToastService } from 'angular-toastify';

interface Room {
  id: number;
  name: string;
  description: string;
  pricePerDay: number;
  pricePerHour?: number;
}

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
})
export class BookingComponent implements OnInit {
  bookingMode: 'daily' | 'hourly' = 'daily';
  checkInDate?: string;
  checkOutDate?: string;
  bookingDate?: string;
  startTime?: string;
  durationHours: number = 1;
  selectedRoomType: string = '';
  numMembers: number = 1;

  fullName: string = '';
  email: string = '';
  phone: string = '';

  roomId?: number;
  room?: Room;

  rooms: Room[] = [
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

  constructor(
    private activatedRoute: ActivatedRoute,
    private cartService: CartService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.roomId = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    this.room = this.rooms.find((r) => r.id === this.roomId);

    this.activatedRoute.queryParams.subscribe((params) => {
      this.bookingMode = params['bookingMode'] || 'daily';
      this.checkInDate = params['checkInDate'];
      this.checkOutDate = params['checkOutDate'];
      this.bookingDate = params['bookingDate'];
      this.startTime = params['startTime'];
      this.durationHours = +params['durationHours'] || 1;
      this.selectedRoomType = params['selectedRoomType'] || '';
      this.numMembers = +params['numMembers'] || 1;
    });
  }

  onBook() {
    if (!this.fullName.trim() || !this.email.trim() || !this.phone.trim()) {
      this.toastService.error(
        'Please provide your full name, email, and phone number.'
      );
      return;
    }

    if (this.bookingMode === 'daily') {
      if (!this.checkInDate || !this.checkOutDate) {
        this.toastService.error('Please select check-in and check-out dates.');
        return;
      }
      if (new Date(this.checkInDate) > new Date(this.checkOutDate)) {
        this.toastService.error('Check-out date must be after check-in date.');
        return;
      }
    } else {
      if (!this.bookingDate || !this.startTime || this.durationHours < 1) {
        this.toastService.error('Please fill all hourly booking details.');
        return;
      }
    }

    if (!this.room) {
      this.toastService.error('Selected room not found.');
      return;
    }

    const item = {
      roomId: this.room.id,
      roomName: this.room.name,
      bookingMode: this.bookingMode,
      checkInDate: this.checkInDate,
      checkOutDate: this.checkOutDate,
      bookingDate: this.bookingDate,
      startTime: this.startTime,
      durationHours: this.durationHours,
      numMembers: this.numMembers,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      price:
        this.bookingMode === 'daily'
          ? this.room.pricePerDay
          : (this.room.pricePerHour || 0) * this.durationHours,
    };

    this.cartService.addItem(item);
    this.toastService.success('Booking added to cart.');
    this.router.navigate(['/customer/cart']);
  }
}
