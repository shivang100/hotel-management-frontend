import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { RoomType } from '../admin-rooms/admin-rooms.component';
import { RoomService, Room } from '../../services/room.service';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-admin-room-edit',
  templateUrl: './admin-room-edit.component.html',
})
export class AdminRoomEditComponent implements OnInit {
  room_types: RoomType[] = [
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

  mainPreview = '';
  secondaryPreviews: string[] = [];

  saving = false;
  deleting = false;

  // ✅ confirm popup state
  showConfirm = false;
  confirmText = '';
  confirmAction: (() => void) | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.editRoomId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.editRoomId) {
      this.toast.error('❌ Invalid room ID');
      this.router.navigate(['/admin/rooms']);
      return;
    }
    this.loadRoom();
  }

  loadRoom() {
    this.roomService.getRoom(this.editRoomId).subscribe({
      next: (room) => {
        this.room = room;
        this.mainPreview = room.main_image || '';
        this.secondaryPreviews = (room.secondary_images || []).slice();
      },
      error: (err) => {
        console.error('Failed to load room:', err);
        this.toast.error('❌ Room not found');
        this.router.navigate(['/admin/rooms']);
      },
    });
  }

  onMainImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && this.room) {
      const reader = new FileReader();
      reader.onload = () => {
        const data = reader.result as string;
        this.room!.main_image = data;
        this.mainPreview = data;
      };
      reader.readAsDataURL(file);
    }
  }

  onSecondaryImagesSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0 || !this.room) return;

    if (!this.room.secondary_images) this.room.secondary_images = [];
    Array.from(files).forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        const data = reader.result as string;
        this.room!.secondary_images!.push(data);
        this.secondaryPreviews.push(data);
      };
      reader.readAsDataURL(f);
    });
  }

  removeSecondaryAt(i: number) {
    if (!this.room?.secondary_images) return;
    this.room.secondary_images.splice(i, 1);
    this.secondaryPreviews.splice(i, 1);
  }

  saveRoom() {
    if (!this.room) return;

    if (
      !this.room.name ||
      !this.room.description ||
      !this.room.price_per_day ||
      !this.room.room_type ||
      !this.room.main_image ||
      (this.room.secondary_images?.length || 0) < 2
    ) {
      this.toast.warn(
        '⚠️ Please fill all required fields and add at least 2 secondary images.'
      );
      return;
    }

    const payload = {
      name: this.room.name,
      description: this.room.description,
      room_type: this.room.room_type,
      price_per_day: this.room.price_per_day,
      price_per_hour: this.room.price_per_hour,
      main_image: this.room.main_image,
      secondary_images: this.room.secondary_images ?? [],
    };

    this.saving = true;
    this.roomService.updateRoom(this.editRoomId, payload).subscribe({
      next: (updated) => {
        this.room = updated;
        this.toast.success('✅ Room updated successfully');
        this.router.navigate(['/admin/rooms']);
      },
      error: (err) => {
        console.error('Error updating room:', err);
        this.toast.error(err?.error?.message || '❌ Error updating room');
      },
      complete: () => (this.saving = false),
    });
  }

  // ✅ show confirm popup
  deleteThisRoom() {
    if (!this.room) return;
    this.confirmText = `Delete room "${this.room.name}" (ID: ${this.room.id})?`;
    this.confirmAction = () => this.deleteRoomConfirmed();
    this.showConfirm = true;
  }

  private deleteRoomConfirmed() {
    if (!this.room) return;
    this.deleting = true;
    this.roomService.deleteRoom(this.room.id).subscribe({
      next: () => {
        this.toast.success('🗑️ Room deleted');
        this.router.navigate(['/admin/rooms']);
      },
      error: (err) => {
        console.error('Delete failed', err);
        this.toast.error('❌ Failed to delete room');
      },
      complete: () => (this.deleting = false),
    });
  }

  // ✅ confirm popup handlers
  runConfirm() {
    if (this.confirmAction) this.confirmAction();
    this.closeConfirm();
  }

  closeConfirm() {
    this.showConfirm = false;
    this.confirmText = '';
    this.confirmAction = null;
  }
}
