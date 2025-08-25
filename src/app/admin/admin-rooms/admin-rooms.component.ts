import { Component, OnInit } from '@angular/core';

export type RoomType =
  | 'Normal - AC'
  | 'Normal - Non AC'
  | 'Deluxe'
  | 'Deluxe - Balcony View'
  | 'Deluxe - Infinity Pool'
  | 'Super Deluxe'
  | 'Super Deluxe - Balcony View'
  | 'Super Deluxe - Infinity Pool';

export interface Room {
  id: number;
  name: string;
  description: string;
  roomType: string;
  pricePerDay: number;
  pricePerHour?: number;
  mainImage?: string;
  secondaryImages?: string[];
}

@Component({
  selector: 'app-admin-rooms',
  templateUrl: './admin-rooms.component.html',
})
export class AdminRoomsComponent implements OnInit {
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
    roomType: '',
    pricePerDay: 0,
    pricePerHour: 0,
    mainImage: '',
    secondaryImages: [],
  };

  constructor() {}

  ngOnInit(): void {
    // Initialize with mock data
    this.rooms = [
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
  }

  onMainImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.newRoom.mainImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSecondaryImagesSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length >= 2) {
      this.newRoom.secondaryImages = [];
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = () => {
          this.newRoom.secondaryImages?.push(reader.result as string);
        };
        reader.readAsDataURL(files[i]);
      }
    } else {
      alert('Please select at least 2 secondary images.');
    }
  }

  addRoom() {
    if (
      !this.newRoom.name ||
      !this.newRoom.description ||
      !this.newRoom.pricePerDay ||
      !this.newRoom.roomType ||
      !this.newRoom.mainImage ||
      (this.newRoom.secondaryImages?.length || 0) < 2
    ) {
      alert('Please fill all required fields and upload images.');
      return;
    }

    const newId = this.rooms.length
      ? Math.max(...this.rooms.map((r) => r.id)) + 1
      : 1;
    const room: Room = {
      id: newId,
      name: this.newRoom.name!,
      description: this.newRoom.description!,
      pricePerDay: this.newRoom.pricePerDay!,
      pricePerHour: this.newRoom.pricePerHour || 0,
      roomType: this.newRoom.roomType as RoomType,
      mainImage: this.newRoom.mainImage!,
      secondaryImages: this.newRoom.secondaryImages!,
    };
    this.rooms.push(room);

    // Reset form
    this.newRoom = {
      name: '',
      description: '',
      pricePerDay: 0,
      pricePerHour: 0,
      roomType: '',
      mainImage: '',
      secondaryImages: [],
    };

    alert('Room added successfully');
  }
}
