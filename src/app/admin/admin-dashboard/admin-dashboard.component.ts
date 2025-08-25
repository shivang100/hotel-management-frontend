import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType, ChartData } from 'chart.js';

interface Booking {
  id: number;
  customerName: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  checkInDate: string;
  checkOutDate: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  totalRooms = 20;
  totalBookings = 50;
  totalCustomers = 15;
  revenueThisMonth = 12345;

  bookings: Booking[] = [];

  // Chart configuration
  public bookingStatusChartLabels = ['Confirmed', 'Pending', 'Cancelled'];

  public bookingStatusChartData: ChartData<'pie', number[], string | string[]> =
    {
      labels: this.bookingStatusChartLabels,
      datasets: [
        {
          data: [10, 7, 3],
          backgroundColor: ['#4ade80', '#facc15', '#f87171'], // green, yellow, red
        },
      ],
    };

  public bookingStatusChartType: ChartType = 'pie';

  public bookingStatusChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  ngOnInit(): void {
    // Mock bookings data
    this.bookings = [
      {
        id: 1,
        customerName: 'Alice',
        status: 'confirmed',
        checkInDate: '2025-08-22',
        checkOutDate: '2025-08-25',
      },
      {
        id: 2,
        customerName: 'Bob',
        status: 'pending',
        checkInDate: '2025-08-24',
        checkOutDate: '2025-08-27',
      },
      {
        id: 3,
        customerName: 'Charlie',
        status: 'cancelled',
        checkInDate: '2025-08-20',
        checkOutDate: '2025-08-22',
      },
      {
        id: 4,
        customerName: 'David',
        status: 'confirmed',
        checkInDate: '2025-08-26',
        checkOutDate: '2025-08-29',
      },
    ];

    this.updateBookingStatusChart();
  }

  updateBookingStatusChart() {
    const confirmed = this.bookings.filter(
      (b) => b.status === 'confirmed'
    ).length;
    const pending = this.bookings.filter((b) => b.status === 'pending').length;
    const cancelled = this.bookings.filter(
      (b) => b.status === 'cancelled'
    ).length;
    this.bookingStatusChartData.datasets[0].data = [
      confirmed,
      pending,
      cancelled,
    ];
  }

  getRecentBookings() {
    // Return the 5 most recent bookings (simulated by id desc)
    return this.bookings
      .slice()
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);
  }
}
