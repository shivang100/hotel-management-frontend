import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}
