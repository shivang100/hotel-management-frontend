// src/app/customer/payment/payment.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from 'angular-toastify';

type BookingMode = 'daily' | 'hourly';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
})
export class PaymentComponent {
  roomId!: number;
  roomName = '';
  mainImage = '';
  bookingMode: BookingMode = 'daily';
  checkInDate?: string;
  checkOutDate?: string;
  bookingDate?: string;
  startTime?: string;
  durationHours?: number;
  numMembers = 1;
  amount = 0;

  card = { name: '', number: '', expiry: '', cvc: '' };

  paying = false;

  billingForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    gstin: [''],
    address1: ['', [Validators.required]],
    address2: [''],
    city: ['', [Validators.required]],
    state: ['', [Validators.required]],
    postalCode: ['', [Validators.required]],
    country: ['India', [Validators.required]],
  });

  constructor(
    private router: Router,
    private bookingService: BookingService,
    private auth: AuthService,
    private fb: FormBuilder,
    private toast: ToastService // ✅ inject toast
  ) {
    const nav = this.router.getCurrentNavigation();
    const s = (nav?.extras?.state as any) || {};

    if (!s || !s.roomId || !s.amount) {
      this.router.navigate(['/customer/rooms']);
      return;
    }

    this.roomId = s.roomId;
    this.roomName = s.roomName || '';
    this.mainImage = s.mainImage || '';
    this.bookingMode = s.bookingMode || 'daily';
    this.checkInDate = s.checkInDate;
    this.checkOutDate = s.checkOutDate;
    this.bookingDate = s.bookingDate;
    this.startTime = s.startTime;
    this.durationHours = s.durationHours;
    this.numMembers = s.numMembers || 1;
    this.amount = s.amount;

    const user = this.auth.getUser();
    if (user?.email) this.billingForm.patchValue({ email: user.email });
  }

  get f() {
    return this.billingForm.controls;
  }

  backToRoom() {
    this.router.navigate(['/customer/rooms', this.roomId]);
  }

  async onSubmitPayment() {
    if (this.billingForm.invalid) {
      this.billingForm.markAllAsTouched();
      this.toast.error('⚠️ Please fill all required billing fields.');
      return;
    }

    this.paying = true;
    this.toast.info('⏳ Processing your payment...');

    try {
      const customerId = this.auth.getUserId() ?? undefined;

      const payload: any = {
        room_id: this.roomId,
        booking_mode: this.bookingMode,
        check_in_date: this.checkInDate,
        check_out_date: this.checkOutDate,
        booking_date: this.bookingDate,
        start_time: this.startTime,
        duration_hours: this.durationHours,
        status: 'confirmed',
        customer_id: customerId,
        billing: {
          fullName: this.billingForm.value.fullName,
          email: this.billingForm.value.email,
          phone: this.billingForm.value.phone,
          gstin: this.billingForm.value.gstin || '',
          address1: this.billingForm.value.address1,
          address2: this.billingForm.value.address2 || '',
          city: this.billingForm.value.city,
          state: this.billingForm.value.state,
          postalCode: this.billingForm.value.postalCode,
          country: this.billingForm.value.country,
        },
      };

      if (this.bookingMode === 'daily') {
        delete payload.start_time;
        delete payload.duration_hours;
      } else {
        delete payload.check_in_date;
        delete payload.check_out_date;
      }

      await this.bookingService.createBooking(payload).toPromise();

      this.toast.success('✅ Payment successful! Booking confirmed.');
      this.router.navigate(['/customer/bookings'], {
        state: { justPaid: true },
      });
    } catch (e: any) {
      console.error(e);
      this.toast.error(
        e?.error?.error || e?.error?.message || '❌ Payment/booking failed.'
      );
    } finally {
      this.paying = false;
    }
  }
}
