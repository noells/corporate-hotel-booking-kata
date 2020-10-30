import {PlainBooking} from '../../../src/booking/Booking';
import * as uuid from 'uuid';

export class BookingBuilder {
	private constructor(
		private employeeId: string,
		private hotelId: string,
		private roomType: string,
		private checkIn: Date,
		private checkOut: Date,
	) {}

	public static withRandomData(): BookingBuilder {
		const checkIn = new Date();
		const checkOut = new Date(checkIn.getTime() + 1000 * 60 * 60 * 24);
		return new BookingBuilder(uuid.v4(), uuid.v4(), `roomType-${uuid.v4()}`, checkIn, checkOut);
	}

	public static withDatesAndHotelData(
		employeeId: string,
		hotelId: string,
		roomType: string,
		checkIn: Date,
		checkOut: Date,
	): BookingBuilder {
		return new BookingBuilder(employeeId, hotelId, roomType, checkIn, checkOut);
	}

	public build(): PlainBooking {
		return {
			bookingId: uuid.v4(),
			employeeId: this.employeeId,
			hotelId: this.hotelId,
			roomType: this.roomType,
			checkIn: this.checkIn,
			checkOut: this.checkOut,
		};
	}
}
