import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BillingSnapshot {
  fullName: string;
  email: string;
  phone: string;
  gstin?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Booking {
  id?: number;
  room_id: number;
  booking_mode: 'daily' | 'hourly';
  check_in_date?: string;
  check_out_date?: string;
  booking_date?: string;
  start_time?: string;
  duration_hours?: number;
  status?: string;
  customer_id?: number;
  room_name?: string;
  room_type?: string;
  room_main_image?: string;

  // ⬇️ add this
  billing?: BillingSnapshot;
}
@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = 'http://localhost:5000/api/bookings';

  constructor(private http: HttpClient) {}

  createBooking(booking: Booking): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, booking);
  }

  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl);
  }

  getBooking(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  updateBooking(id: number, updates: Partial<Booking>): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}`, updates);
  }

  deleteBooking(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  getBookingsByCustomer(customerId: number) {
    return this.http.get<Booking[]>(`${this.apiUrl}?customer_id=${customerId}`);
  }
}
