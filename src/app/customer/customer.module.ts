import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerComponent } from './customer.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RoomCatalogComponent } from './room-catalog/room-catalog.component';
import { FormsModule } from '@angular/forms';
import { RoomDetailComponent } from './room-detail/room-detail.component';
import { BookingComponent } from './booking/booking.component';
import { CartComponent } from './cart/cart.component';
import { PaymentComponent } from './payment/payment.component';
import { BookingsComponent } from './bookings/bookings.component';
import { SharedModule } from '../shared/shared.module';
import { ProfileComponent } from './profile/profile.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    CustomerComponent,
    DashboardComponent,
    RoomCatalogComponent,
    RoomDetailComponent,
    BookingComponent,
    CartComponent,
    PaymentComponent,
    BookingsComponent,
    ProfileComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    CustomerRoutingModule,
    ReactiveFormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CustomerModule {}
