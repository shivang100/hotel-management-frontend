import { Component, OnInit } from '@angular/core';
import { RoomService, Room } from '../../services/room.service';
import { ToastService } from 'angular-toastify';

export type RoomType =
  | 'Normal - AC'
  | 'Normal - Non AC'
  | 'Deluxe'
  | 'Deluxe - Balcony View'
  | 'Deluxe - Infinity Pool'
  | 'Super Deluxe'
  | 'Super Deluxe - Balcony View'
  | 'Super Deluxe - Infinity Pool';

@Component({
  selector: 'app-admin-rooms',
  templateUrl: './admin-rooms.component.html',
})
export class AdminRoomsComponent implements OnInit {
  constructor(private roomService: RoomService, private toast: ToastService) {}

  roomTypes: RoomType[] = [
    'Normal - AC',
    'Normal - Non AC',
    'Deluxe',
    'Deluxe - Balcony View',
    'Deluxe - Infinity Pool',
    'Super Deluxe',
    'Super Deluxe - Balcony View',
    'Super Deluxe - Infinity Pool',
  ];

  rooms: Room[] = [];

  newRoom: Partial<Room> = {
    name: '',
    description: '',
    room_type: '',
    price_per_day: 0,
    price_per_hour: 0,
    main_image: '',
    secondary_images: [],
  };

  mainPreview = '';
  secondaryPreviews: string[] = [];

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms() {
    this.roomService.getRooms().subscribe({
      next: (rooms) => (this.rooms = rooms || []),
      error: (err) => {
        console.error('Failed to load rooms', err);
        this.toast.error('Could not load rooms. Please try again.');
      },
    });
  }

  onMainImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.newRoom.main_image = reader.result as string;
      this.mainPreview = this.newRoom.main_image!;
    };
    reader.readAsDataURL(file);
  }

  onSecondaryImagesSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length < 2) {
      this.toast.info('Please select at least 2 secondary images.');
      return;
    }
    this.newRoom.secondary_images = [];
    this.secondaryPreviews = [];
    Array.from(files).forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        const data = reader.result as string;
        this.newRoom.secondary_images!.push(data);
        this.secondaryPreviews.push(data);
      };
      reader.readAsDataURL(f);
    });
  }

  addRoom() {
    if (
      !this.newRoom.name ||
      !this.newRoom.description ||
      !this.newRoom.price_per_day ||
      !this.newRoom.room_type ||
      !this.newRoom.main_image ||
      (this.newRoom.secondary_images?.length || 0) < 2
    ) {
      this.toast.info('Please fill all required fields and upload images.');
      return;
    }

    // Let backend assign ID
    const payload: Room = {
      id: 0 as any,
      name: this.newRoom.name!,
      description: this.newRoom.description!,
      price_per_day: this.newRoom.price_per_day!,
      price_per_hour: this.newRoom.price_per_hour || 0,
      room_type: this.newRoom.room_type as RoomType,
      main_image: this.newRoom.main_image!,
      secondary_images: this.newRoom.secondary_images!,
    };

    this.roomService.createRoom(payload).subscribe({
      next: (createdRoom) => {
        this.rooms.push(createdRoom);
        // Reset form + previews
        this.newRoom = {
          name: '',
          description: '',
          price_per_day: 0,
          price_per_hour: 0,
          room_type: '',
          main_image: '',
          secondary_images: [],
        };
        this.mainPreview = '';
        this.secondaryPreviews = [];
        this.toast.success('Room added successfully');
      },
      error: (err) => {
        console.error('Failed to create room', err);
        this.toast.error(err?.error?.message || 'Error creating room.');
      },
    });
  }
}
