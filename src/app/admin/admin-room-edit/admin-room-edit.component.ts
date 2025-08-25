import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Room, RoomType } from '../admin-rooms/admin-rooms.component'; // Adjust path if needed

@Component({
  selector: 'app-admin-room-edit',
  templateUrl: './admin-room-edit.component.html',
})
export class AdminRoomEditComponent implements OnInit {
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

  room: Room | undefined;
  editRoomId!: number;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.editRoomId = Number(this.route.snapshot.paramMap.get('id'));

    // Load the room by id from your data source or backend
    // For now, mock the loading; replace with real data fetching

    // Example mock:
    const roomsFromService: Room[] = [
      {
        id: 1,
        name: 'Standard Room',
        description: 'Basic amenities',
        roomType: 'Normal - AC',
        pricePerDay: 100,
        pricePerHour: 15,
        mainImage: '',
        secondaryImages: [],
      },
      {
        id: 2,
        name: 'Deluxe Room',
        description: 'Premium facilities',
        roomType: 'Deluxe',
        pricePerDay: 180,
        pricePerHour: 25,
        mainImage: '',
        secondaryImages: [],
      },
    ];

    this.room = roomsFromService.find((r) => r.id === this.editRoomId);
    if (!this.room) {
      alert('Room not found');
      this.router.navigate(['/admin/rooms']);
    }
  }

  onMainImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && this.room) {
      const reader = new FileReader();
      reader.onload = () => {
        this.room!.mainImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSecondaryImagesSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length >= 0 && this.room) {
      this.room.secondaryImages = [];
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = () => {
          this.room!.secondaryImages!.push(reader.result as string);
        };
        reader.readAsDataURL(files[i]);
      }
    }
  }

  saveRoom() {
    if (
      !this.room?.name ||
      !this.room?.description ||
      !this.room?.pricePerDay ||
      !this.room?.roomType ||
      !this.room?.mainImage ||
      (this.room.secondaryImages?.length || 0) < 2
    ) {
      alert('Please fill all required fields and upload images.');
      return;
    }

    // Save to backend here or update service

    alert('Room updated successfully');
    this.router.navigate(['/admin/rooms']);
  }
}
