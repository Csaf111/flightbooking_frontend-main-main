import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { FlightService } from '../services/flight.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  flights: any[] = [];
  bookings: any[] = [];
  booking: any = {
    flight_number: '',
    passenger_name: '',
    passport_number: '',
    email: '',
    phone_number: '',
    seat_class: '',
    contact_details: ''
  };
  editingId: string | null = null;
  successMessage = '';
  errorMessage = '';
  user: any;

  constructor(
    private flightService: FlightService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.user;
    if (this.user) {
      this.booking.passenger_name = this.user.username;
      this.loadFlights();
      this.loadBookings();
    }
  }

  loadFlights(): void {
    this.flightService.getAllFlights().subscribe({
      next: flights => this.flights = flights,
      error: err => console.error('Error loading flights', err)
    });
  }

  loadBookings(): void {
    this.flightService.getAllBookings().subscribe({
      next: data => {
        this.bookings = data.filter(b => b.passenger_name === this.user?.username);
      },
      error: err => console.error('Error fetching bookings', err)
    });
  }

  bookFlight(): void {
    this.flightService.createBooking(this.booking).subscribe({
      next: () => {
        this.successMessage = '✅ Booking successful!';
        this.errorMessage = '';
        this.resetForm();
        this.loadBookings();
      },
      error: err => {
        console.error('Error booking flight', err);
        this.successMessage = '';
        this.errorMessage = '⚠️ Failed to book flight.';
      }
    });
  }

  editBooking(booking: any): void {
    this.booking = { ...booking };
    this.editingId = booking._id;
    this.successMessage = '';
    this.errorMessage = '';
  }

  updateBooking(): void {
    if (!this.editingId) return;
    this.flightService.updateBooking(this.editingId, this.booking).subscribe({
      next: () => {
        this.successMessage = '✅ Booking updated successfully!';
        this.errorMessage = '';
        this.resetForm();
        this.loadBookings();
      },
      error: err => {
        console.error('Error updating booking', err);
        this.successMessage = '';
        this.errorMessage = '⚠️ Failed to update booking.';
      }
    });
  }

  deleteBooking(id: string): void {
    this.flightService.deleteBooking(id).subscribe({
      next: () => {
        this.successMessage = '✅ Booking deleted!';
        this.errorMessage = '';
        this.loadBookings();
      },
      error: err => {
        console.error('Error deleting booking', err);
        this.successMessage = '';
        this.errorMessage = '⚠️ Failed to delete booking.';
      }
    });
  }

  resetForm(): void {
    this.booking = {
      flight_number: '',
      passenger_name: this.user?.username || '',
      passport_number: '',
      email: '',
      phone_number: '',
      seat_class: '',
      contact_details: ''
    };
    this.editingId = null;
  }
}
