import { Component, OnInit } from '@angular/core';
import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';

import { RoomService, Room } from '../../services/room.service';
import { BookingFilterService } from '../../services/booking-filter.service';
import { ToastService } from 'angular-toastify';

type PriceFilter = '' | 'low' | 'medium' | 'high';

@Component({
  selector: 'app-room-catalog',
  templateUrl: './room-catalog.component.html',
  animations: [
    trigger('listStagger', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(10px)' }),
            stagger(70, [
              animate(
                '400ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
})
export class RoomCatalogComponent implements OnInit {
  rooms: Room[] = [];
  filteredList: Room[] = [];
  loading = false;

  // filters
  searchText = '';
  selectedPriceFilter: PriceFilter = '';

  bookingMode: 'daily' | 'hourly' = 'daily';

  // debounce handle for toasts
  private filterDebounce: any;

  constructor(
    private roomService: RoomService,
    private filterService: BookingFilterService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const f =
      (this.filterService.getFilters?.() as any) ??
      (this.filterService as any)['filters'] ??
      {};
    if (f.bookingMode === 'hourly' || f.bookingMode === 'daily') {
      this.bookingMode = f.bookingMode;
    }

    this.loadRooms();
  }

  loadRooms() {
    this.loading = true;
    this.toast.info('⏳ Loading rooms...');
    this.roomService.getRooms().subscribe({
      next: (res) => {
        this.rooms = res || [];
        this.loading = false;
        this.applyFilters(true); // initial compute + toast
      },
      error: (err) => {
        console.error('Failed to load rooms', err);
        this.rooms = [];
        this.toast.error('❌ Failed to load rooms');
        this.loading = false;
      },
    });
  }

  private computeFiltered(): Room[] {
    let list = [...this.rooms];

    // text search
    const q = this.searchText.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.room_type || '').toLowerCase().includes(q) ||
          (r.description || '').toLowerCase().includes(q)
      );
    }

    // price filter
    if (this.selectedPriceFilter) {
      list = list.filter((r) => {
        const price =
          this.bookingMode === 'hourly'
            ? r.price_per_hour ??
              Math.max(1, Math.round((r.price_per_day || 0) / 24))
            : r.price_per_day;

        if (this.selectedPriceFilter === 'low') return price < 150;
        if (this.selectedPriceFilter === 'medium')
          return price >= 150 && price <= 250;
        return price > 250;
      });
    }

    return list;
  }

  applyFilters(initial = false) {
    this.filteredList = this.computeFiltered();

    if (initial) {
      if (this.filteredList.length) {
        this.toast.success(`✅ ${this.filteredList.length} rooms available`);
      } else {
        this.toast.warn('⚠️ No rooms available at the moment');
      }
      return;
    }

    clearTimeout(this.filterDebounce);
    this.filterDebounce = setTimeout(() => {
      const n = this.filteredList.length;
      if (n > 0) {
        this.toast.success(`🔍 ${n} room${n > 1 ? 's' : ''} match your search`);
      } else {
        this.toast.warn('⚠️ No rooms match your search');
      }
    }, 400);
  }

  onSearchInput(_: any) {
    this.applyFilters();
  }
  onPriceFilterChange(_: any) {
    this.applyFilters();
  }

  setBookingMode(mode: 'daily' | 'hourly') {
    if (this.bookingMode === mode) return;
    this.bookingMode = mode;

    try {
      if (this.filterService?.setFilters) {
        const current =
          (this.filterService.getFilters?.() as any) ??
          (this.filterService as any)['filters'] ??
          {};
        this.filterService.setFilters({ ...current, bookingMode: mode });
      }
    } catch (e) {
      console.warn('Could not persist booking mode to filter service', e);
    }

    this.toast.info(`🔄 Booking mode set to ${mode.toUpperCase()}`);
    this.applyFilters();
  }

  clearFilters() {
    this.searchText = '';
    this.selectedPriceFilter = '';
    this.bookingMode = 'daily';
    this.applyFilters();
    this.toast.info('✨ Filters cleared');
  }

  displayPrice(room: Room): { value: number; unit: '/day' | '/hour' } {
    if (this.bookingMode === 'hourly') {
      const val =
        room.price_per_hour ??
        Math.max(1, Math.round((room.price_per_day || 0) / 24));
      return { value: val, unit: '/hour' };
    }
    return { value: room.price_per_day, unit: '/day' };
  }

  viewRoomDetails(room: Room) {
    this.toast.info(`ℹ️ Viewing details for ${room.name}`);
    // Could navigate with routerLink in template
  }

  trackByRoomId(_: number, r: Room) {
    return r.id;
  }
}
