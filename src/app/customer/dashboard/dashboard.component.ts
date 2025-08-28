import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingFilterService } from '../../services/booking-filter.service';
import { RoomService, Room } from '../../services/room.service';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  slides = [
    'assets/color-year-interior-design-space-with-furniture-decor.jpg',
    'assets/img2.jpg',
    'assets/small-hotel-room-interior-with-double-bed-bathroom.jpg',
  ];

  bookingMode: 'daily' | 'hourly' = 'daily';
  checkInDate?: string;
  checkOutDate?: string;
  bookingDate?: string;
  startTime?: string;
  durationHours: number = 1;
  selectedRoomType: string = '';
  numMembers: number = 1;

  allRooms: Room[] = [];
  featuredRooms: Room[] = [];
  searchResults: Room[] | null = null;

  loading = false;
  error = '';

  constructor(
    private router: Router,
    private filterService: BookingFilterService,
    private roomService: RoomService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  private loadRooms() {
    this.loading = true;
    this.toast.info('⏳ Loading suggested rooms...'); // ✅ loading toast

    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        this.allRooms = rooms;
        this.featuredRooms = [...rooms]
          .sort((a, b) => b.price_per_day - a.price_per_day)
          .slice(0, 6);
        this.loading = false;

        this.toast.success('✅ Suggested rooms loaded'); // ✅ success toast
      },
      error: (err) => {
        console.error('Failed to load rooms', err);
        this.toast.error('❌ Could not load rooms'); // ✅ error toast
        this.loading = false;
      },
    });
  }

  // --- Date helpers ---
  private toDateStr(d: Date): string {
    return d.toISOString().slice(0, 10);
  }
  get todayStr(): string {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return this.toDateStr(now);
  }
  get tomorrowStr(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return this.toDateStr(d);
  }
  get checkoutMinDate(): string {
    if (this.checkInDate) {
      const ci = new Date(this.checkInDate);
      ci.setDate(ci.getDate() + 1);
      return this.toDateStr(ci);
    }
    return this.tomorrowStr;
  }

  // --- Price label ---
  priceLabel(room: Room): string {
    return this.bookingMode === 'daily'
      ? `₹${room.price_per_day} / day`
      : `₹${room.price_per_hour} / hour`;
  }

  // --- Filter helpers ---
  private filterByCriteria(rooms: Room[]): Room[] {
    let filtered = rooms;
    if (this.selectedRoomType) {
      const needle = this.selectedRoomType.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.room_type.toLowerCase().includes(needle) ||
          r.name.toLowerCase().includes(needle)
      );
    }
    return filtered;
  }

  // --- Search rooms ---
  onSearchRooms() {
    this.toast.info('⏳ Searching rooms...');

    if (this.numMembers > 2) {
      this.toast.warn('⚠️ Maximum capacity per room is 2');
      return;
    }

    if (this.bookingMode === 'daily') {
      if (!this.checkInDate || !this.checkOutDate) {
        this.toast.error('Please select check-in and check-out dates');
        return;
      }
      const ci = new Date(this.checkInDate);
      const co = new Date(this.checkOutDate);
      const today = new Date(this.todayStr);

      if (ci < today) {
        this.toast.error('Check-in cannot be before today');
        return;
      }
      if (co <= ci) {
        this.toast.error('Check-out must be at least one day after check-in');
        return;
      }
      const todayMidnight = new Date(this.todayStr);
      if (this.toDateStr(co) === this.toDateStr(todayMidnight)) {
        this.toast.error('Check-out cannot be today');
        return;
      }
    } else {
      if (!this.bookingDate || !this.startTime || this.durationHours < 1) {
        this.toast.error('Please fill all hourly booking details');
        return;
      }
      const bd = new Date(this.bookingDate);
      const today = new Date(this.todayStr);
      if (bd < today) {
        this.toast.error('Booking date cannot be before today');
        return;
      }
    }

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

    this.searchResults = this.filterByCriteria(this.allRooms);

    if (this.searchResults.length) {
      this.toast.success('✅ Rooms found, check the results below');
    } else {
      this.toast.warn('⚠️ No rooms match your search');
    }
  }

  // --- Room details ---
  viewRoom(room: Room) {
    this.router.navigate(['/customer/rooms', room.id]);
  }
}
