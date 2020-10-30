export interface PlainBooking {
	bookingId: string;
	employeeId: string;
	hotelId: string;
	roomType: string;
	checkIn: Date;
	checkOut: Date;
}

export class Booking {
	public constructor(
		private readonly bookingId: string,
		private readonly employeeId: string,
		private readonly hotelId: string,
		private readonly roomType: string,
		private readonly checkIn: Date,
		private readonly checkOut: Date,
	) {}

	public toPlainBooking(): PlainBooking {
		return {
			bookingId: this.bookingId,
			employeeId: this.employeeId,
			hotelId: this.hotelId,
			roomType: this.roomType,
			checkIn: this.checkIn,
			checkOut: this.checkOut,
		};
	}
}
