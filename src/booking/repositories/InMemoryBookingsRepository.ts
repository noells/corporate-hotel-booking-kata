import {none, Option, some} from 'ts-option';
import {PlainBooking} from '../Booking';
import {BookingsRepository} from './BookingsRepository';

export class InMemoryBookingsRepository implements BookingsRepository {
	private bookings: Map<string, PlainBooking>;
	public constructor() {
		this.bookings = new Map<string, PlainBooking>();
	}

	public async save(booking: PlainBooking): Promise<void> {
		this.bookings.set(booking.bookingId, booking);
	}

	public async getBookings(): Promise<PlainBooking[]> {
		return [...this.bookings.values()];
	}

	public async getBookingsForEmployee(employeeId: string): Promise<PlainBooking[]> {
		return [...this.bookings.values()].filter((b) => b.employeeId === employeeId);
	}

	public async getBookingById(bookingId: string): Promise<Option<PlainBooking>> {
		const booking = this.bookings.get(bookingId);
		return booking ? some(booking) : none;
	}

	public async delete(bookingId: string): Promise<void> {
		this.bookings.delete(bookingId);
	}

	public async getByHotelId(hotelId: string): Promise<Option<PlainBooking[]>> {
		return some([...this.bookings.values()].filter((b) => b.hotelId === hotelId));
	}

	public async deleteEmployeeBookings(employeeId: string): Promise<void> {
		const employeeBookingsIds = [...this.bookings.values()]
			.filter((b) => b.employeeId === employeeId)
			.map((b) => b.bookingId);

		employeeBookingsIds.forEach((bookingId) => this.bookings.delete(bookingId));
	}
}
