import { Component, OnInit } from '@angular/core';
import { jsPDF } from 'jspdf'; // Import jsPDF
import { ToastService } from 'angular-toastify';

interface Booking {
  id: number;
  customerName: string;
  roomName: string;
  bookingMode: 'daily' | 'hourly';
  checkInDate?: string;
  checkOutDate?: string;
  bookingDate?: string;
  startTime?: string;
  durationHours?: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

@Component({
  selector: 'app-admin-bookings',
  templateUrl: './admin-bookings.component.html',
})
export class AdminBookingsComponent implements OnInit {
  bookings: Booking[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    // Mock data for bookings
    this.bookings = [
      {
        id: 1,
        customerName: 'Alice',
        roomName: 'Standard Room',
        bookingMode: 'daily',
        checkInDate: '2025-09-01',
        checkOutDate: '2025-09-05',
        status: 'pending',
      },
      {
        id: 2,
        customerName: 'Bob',
        roomName: 'Suite',
        bookingMode: 'hourly',
        bookingDate: '2025-09-10',
        startTime: '14:00',
        durationHours: 3,
        status: 'confirmed',
      },
    ];
  }

  updateStatus(booking: Booking, status: Booking['status']) {
    booking.status = status;
    this.toastService.success(`Booking #${booking.id} marked as ${status}`);
    // TODO: Update backend here
  }

  downloadBookingPDF(booking: Booking) {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Booking Details', 14, 20);

    doc.setFontSize(12);
    let y = 30;

    doc.text(`Booking ID: ${booking.id}`, 14, y);
    y += 10;

    doc.text(`Customer Name: ${booking.customerName}`, 14, y);
    y += 10;

    doc.text(`Room Name: ${booking.roomName}`, 14, y);
    y += 10;

    doc.text(`Booking Mode: ${booking.bookingMode}`, 14, y);
    y += 10;

    if (booking.bookingMode === 'daily') {
      doc.text(`Check-in Date: ${booking.checkInDate}`, 14, y);
      y += 10;
      doc.text(`Check-out Date: ${booking.checkOutDate}`, 14, y);
      y += 10;
    } else if (booking.bookingMode === 'hourly') {
      doc.text(`Booking Date: ${booking.bookingDate}`, 14, y);
      y += 10;
      doc.text(`Start Time: ${booking.startTime}`, 14, y);
      y += 10;
      doc.text(`Duration (hours): ${booking.durationHours}`, 14, y);
      y += 10;
    }

    doc.text(`Status: ${booking.status}`, 14, y);

    doc.save(`Booking_${booking.id}.pdf`);
  }
}
