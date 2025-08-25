import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerComponent } from './customer.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RoomCatalogComponent } from './room-catalog/room-catalog.component';
import { RoomDetailComponent } from './room-detail/room-detail.component';
import { BookingComponent } from './booking/booking.component';
import { CartComponent } from './cart/cart.component';
import { PaymentComponent } from './payment/payment.component';
import { BookingsComponent } from './bookings/bookings.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'rooms', component: RoomCatalogComponent },
  { path: 'booking/:id', component: BookingComponent },
  { path: 'rooms/:id', component: RoomDetailComponent },
  { path: 'cart', component: CartComponent },
  { path: 'bookings', component: BookingsComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'payment', component: PaymentComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerRoutingModule {}
