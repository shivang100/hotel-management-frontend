import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { SharedModule } from '../shared/shared.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminRoomsComponent } from './admin-rooms/admin-rooms.component';
import { FormsModule } from '@angular/forms';
import { AdminBookingsComponent } from './admin-bookings/admin-bookings.component';
import { AdminProfileComponent } from './admin-profile/admin-profile.component';
import { AdminRoomEditComponent } from './admin-room-edit/admin-room-edit.component';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    AdminComponent,
    AdminDashboardComponent,
    AdminRoomsComponent,
    AdminBookingsComponent,
    AdminProfileComponent,
    AdminRoomEditComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    AdminRoutingModule,
    NgChartsModule,
  ],
})
export class AdminModule {}
