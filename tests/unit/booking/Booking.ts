import {BookingService} from '../../../src/booking/BookingService';
import * as sinon from 'ts-sinon';
import {HotelService} from '../../../src/hotel/HotelService';
import {BookingPolicyService} from '../../../src/bookingPolicy/BookingPolicyService';
import {BookingsRepository} from '../../../src/booking/repositories/BookingsRepository';
import {InMemoryBookingsRepository} from '../../../src/booking/repositories/InMemoryBookingsRepository';
import * as uuid from 'uuid';
import {PlainHotel} from '../../../src/hotel/Hotel';
import {expect} from 'chai';
import {EventEmitter} from 'events';

describe('tests/unit/booking/Booking', () => {
	describe('Given the Booking Service is running', () => {
		let bookingService: BookingService;
		let bookingsRepository: BookingsRepository;

		let bookingPolicyService: sinon.StubbedInstance<BookingPolicyService>;
		let hotelServiceMock: sinon.StubbedInstance<HotelService>;

		let eventEmitter: EventEmitter;

		before(() => {
			bookingPolicyService = sinon.stubInterface();
			hotelServiceMock = sinon.stubInterface();

			bookingsRepository = new InMemoryBookingsRepository();

			eventEmitter = new EventEmitter();

			bookingService = new BookingService(
				bookingPolicyService,
				hotelServiceMock,
				bookingsRepository,
				eventEmitter,
			);

			bookingPolicyService.isBookingAllowed.resolves(false);
			hotelServiceMock.findHotelById.resolves(({rooms: []} as unknown) as PlainHotel);
		});

		describe('Given a valid hotel', () => {
			let employeeId: string;
			let hotelId: string;
			let roomType: string;
			let checkIn: Date;
			let checkOut: Date;

			beforeEach(async () => {
				employeeId = uuid.v4();
				hotelId = uuid.v4();
				roomType = `roomType-${uuid.v4()}`;
				checkIn = new Date();
				checkOut = new Date(checkIn.getTime() + 555555);

				bookingPolicyService.isBookingAllowed.withArgs(employeeId, roomType).resolves(true);
				hotelServiceMock.findHotelById.withArgs(hotelId).resolves({
					hotelId,
					rooms: [
						{
							roomType,
							quantity: 2,
						},
					],
				});
			});

			it('should be possible to make a booking', async () => {
				const booking = await bookingService.book(employeeId, hotelId, roomType, checkIn, checkOut);
				expect(booking.employeeId).to.deep.equals(employeeId);
				expect(booking.hotelId).to.deep.equals(hotelId);
				expect(booking.roomType).to.deep.equals(roomType);
				expect(booking.checkIn).to.deep.equals(checkIn);
				expect(booking.checkOut).to.deep.equals(checkOut);
			});

			describe('Given an employee has a booking', () => {
				beforeEach(async () => {
					await bookingService.book(employeeId, hotelId, roomType, checkIn, checkOut);
				});

				describe('And the employee is removed', () => {
					beforeEach(() => {
						eventEmitter.emit(BookingService.EMPLOYEE_DELETED, employeeId);
					});

					it('his bookings should be removed', async () => {
						const employeeBookings = await bookingService.getBookingsForEmployee(employeeId);
						expect(employeeBookings).to.have.lengthOf(0);
					});
				});
			});
		});
	});
});
