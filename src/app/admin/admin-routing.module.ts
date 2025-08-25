import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminRoomsComponent } from './admin-rooms/admin-rooms.component';
import { AdminBookingsComponent } from './admin-bookings/admin-bookings.component';
import { AdminProfileComponent } from './admin-profile/admin-profile.component';
import { AdminRoomEditComponent } from './admin-room-edit/admin-room-edit.component';

const routes: Routes = [
  { path: '', component: AdminDashboardComponent },
  { path: 'rooms', component: AdminRoomsComponent },
  { path: 'bookings', component: AdminBookingsComponent },
  { path: 'profile', component: AdminProfileComponent },
  { path: 'rooms/edit/:id', component: AdminRoomEditComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
