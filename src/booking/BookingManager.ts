import {PlainHotel} from '../hotel/Hotel';
import {Booking, PlainBooking} from './Booking';
import {BookingsRepository} from './repositories/BookingsRepository';
import * as uuid from 'uuid';

const isBookingBetweenDates = (
	booking: PlainBooking,
	dates: {checkIn: Date; checkOut: Date},
): boolean => {
	if (booking.checkIn >= dates.checkIn && booking.checkIn <= dates.checkOut) {
		return true;
	} else if (booking.checkOut >= dates.checkIn && booking.checkOut <= dates.checkOut) {
		return true;
	}

	return false;
};

export class BookingManager {
	public constructor(private readonly repository: BookingsRepository) {}

	public async makeBooking(
		employeeId: string,
		hotel: PlainHotel,
		roomType: string,
		checkIn: Date,
		checkOut: Date,
	): Promise<PlainBooking> {
		const maxRooms = hotel.rooms.filter((r) => r.roomType === roomType)[0].quantity;
		const bookings = (await this.repository.getByHotelId(hotel.hotelId)).get.filter(
			(b) => b.roomType === roomType,
		);
		const bookingsInPeriod = bookings.filter((b) =>
			isBookingBetweenDates(b, {
				checkIn,
				checkOut,
			}),
		);

		if (bookingsInPeriod.length >= maxRooms) {
			throw new Error(`It is not possible to make a booking in the provided dates`);
		}

		const booking = new Booking(uuid.v4(), employeeId, hotel.hotelId, roomType, checkIn, checkOut);
		await this.repository.save(booking.toPlainBooking());

		return booking.toPlainBooking();
	}

	public async getBookings(): Promise<PlainBooking[]> {
		return this.repository.getBookings();
	}

	public async getBookingsForEmployee(employeeId: string): Promise<PlainBooking[]> {
		return this.repository.getBookingsForEmployee(employeeId);
	}

	public async removeBooking(bookingId: string): Promise<void> {
		await this.repository.delete(bookingId);
	}

	public async deleteBookingsForEmployee(employeeId: string): Promise<void> {
		await this.repository.deleteEmployeeBookings(employeeId);
	}
}
