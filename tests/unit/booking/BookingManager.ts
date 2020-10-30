import {BookingManager} from '../../../src/booking/BookingManager';
import {BookingsRepository} from '../../../src/booking/repositories/BookingsRepository';
import {InMemoryBookingsRepository} from '../../../src/booking/repositories/InMemoryBookingsRepository';
import {Hotel} from '../../../src/hotel/Hotel';
import * as uuid from 'uuid';
import {PlainBooking} from '../../../src/booking/Booking';
import {expect} from 'chai';

describe('tests/unit/booking/BookingManager', () => {
	let bookingManager: BookingManager;
	let repository: BookingsRepository;

	before(() => {
		repository = new InMemoryBookingsRepository();
		bookingManager = new BookingManager(repository);
	});

	describe('Given a hotel has only two rooms of a given type', () => {
		let hotel: Hotel;
		let roomType: string;
		const quantity = 2;

		beforeEach(() => {
			roomType = `roomType-${uuid.v4()}`;
			hotel = new Hotel(uuid.v4(), [{quantity, roomType}]);
		});

		describe('And two bookings exist for a day on that room', () => {
			let bookings: PlainBooking[];
			let employeeId: string;
			let checkIn: Date;
			let checkOut: Date;

			beforeEach(async () => {
				employeeId = uuid.v4();
				checkIn = new Date(2020, 4, 3);
				checkOut = new Date(2020, 4, 4);
				bookings = [
					{
						bookingId: uuid.v4(),
						employeeId,
						hotelId: hotel.toPlainHotel().hotelId,
						roomType,
						checkIn,
						checkOut,
					},
					{
						bookingId: uuid.v4(),
						employeeId,
						hotelId: hotel.toPlainHotel().hotelId,
						roomType,
						checkIn,
						checkOut,
					},
				];
				await Promise.all(bookings.map((b) => repository.save(b)));
			});

			afterEach(async () => {
				await Promise.all(bookings.map((b) => repository.delete(b.bookingId)));
			});

			it('should not be possible to make a booking for that day', async () => {
				await expect(
					bookingManager.makeBooking(employeeId, hotel.toPlainHotel(), roomType, checkIn, checkOut),
				).to.be.eventually.rejectedWith(Error);
			});
		});
	});
});
