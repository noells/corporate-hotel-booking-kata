import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const expect = chai.expect;
import {EventEmitter} from 'events';
import * as uuid from 'uuid';
import {BookingService} from '../../src/booking/BookingService';
import {BookingPolicyService} from '../../src/bookingPolicy/BookingPolicyService';
import {BookingPolicyRepository} from '../../src/bookingPolicy/repositories/BookingPolicyRepository';
import {InMemoryBookinPolicyRepository} from '../../src/bookingPolicy/repositories/InMemoryBookingPolicyRepository';
import {CompanyService} from '../../src/company/CompanyService';
import {CompanyRepository} from '../../src/company/repositories/CompanyRepository';
import {InMemoryCompanyRepository} from '../../src/company/repositories/InMemoryCompanyRepository';
import {HotelService} from '../../src/hotel/HotelService';
import * as sinon from 'ts-sinon';
import {HotelRepository} from '../../src/hotel/repositories/HotelRepository';
import {InMemoryHotelRepository} from '../../src/hotel/repositories/InMemoryHotelRepository';
import {BookingBuilder} from './utils/BookingBuilder';
import {PlainBooking} from '../../src/booking/Booking';
import {BookingsRepository} from '../../src/booking/repositories/BookingsRepository';
import {InMemoryBookingsRepository} from '../../src/booking/repositories/InMemoryBookingsRepository';
import {omit} from 'ramda';

describe('tests/acceptance/HotelBooking', () => {
	describe('Given Booking Policy and Company services are running', () => {
		let bookingPolicyService: BookingPolicyService;
		let bookingPolicyRepository: BookingPolicyRepository;
		let companyService: CompanyService;
		let companyRepository: CompanyRepository;
		let eventEmitter: EventEmitter;

		before(() => {
			eventEmitter = new EventEmitter();
			companyRepository = new InMemoryCompanyRepository();
			companyService = new CompanyService(eventEmitter, companyRepository);

			bookingPolicyRepository = new InMemoryBookinPolicyRepository();
			bookingPolicyService = new BookingPolicyService(
				bookingPolicyRepository,
				companyService,
				eventEmitter,
			);
		});

		describe('Given a company has two employees and a booking policy', () => {
			let companyId: string;
			let employeeId: string;
			let employeeId2: string;

			beforeEach(async () => {
				companyId = uuid.v4();
				employeeId = uuid.v4();
				employeeId2 = uuid.v4();

				await companyService.addEmployee(companyId, employeeId);
				await companyService.addEmployee(companyId, employeeId2);

				await bookingPolicyService.setCompanyPolicy(companyId, ['single']);
			});

			it('should be possible to check if the employees are allowed to book', async () => {
				const isBookable = await bookingPolicyService.isBookingAllowed(employeeId, 'single');
				expect(isBookable).to.equals(true);
			});

			it('employees should not be allowed to book a random room', async () => {
				const isBookable = await bookingPolicyService.isBookingAllowed(employeeId, 'double');
				expect(isBookable).to.equals(false);
			});

			describe('Given a third employee with custom policy booking', () => {
				let employeeId3: string;

				beforeEach(async () => {
					employeeId3 = uuid.v4();
					await companyService.addEmployee(companyId, employeeId3);

					await bookingPolicyService.setEmployeePolicy(employeeId3, ['double']);
				});

				it('should be able to make a different booking', async () => {
					const isBookable = await bookingPolicyService.isBookingAllowed(employeeId3, 'double');
					expect(isBookable).to.equals(true);
				});
			});

			describe('When a employee is deleted', () => {
				let employeeId3: string;
				let otherCompanyId: string;

				beforeEach(async () => {
					employeeId3 = uuid.v4();
					otherCompanyId = uuid.v4();
					await companyService.addEmployee(otherCompanyId, employeeId3);
					await bookingPolicyService.setEmployeePolicy(employeeId3, ['double']);

					await companyService.deleteEmployee(employeeId3);
				});

				it('all her policies must be deleted', async () => {
					const policy = await bookingPolicyRepository.getByEmployeeId(employeeId3);
					expect(policy.isEmpty).to.be.true;
				});
			});
		});
	});

	describe('Given Booking and Hotel Service are up', () => {
		let bookingService: BookingService;
		let bookingsRepository: BookingsRepository;
		let eventEmitter: EventEmitter;

		let bookingPolicyService: sinon.StubbedInstance<BookingPolicyService>;
		let hotelService: HotelService;
		let hotelRepository: HotelRepository;

		before(() => {
			eventEmitter = new EventEmitter();

			bookingPolicyService = sinon.stubInterface();
			hotelRepository = new InMemoryHotelRepository();
			hotelService = new HotelService(hotelRepository);

			bookingsRepository = new InMemoryBookingsRepository();
			bookingService = new BookingService(
				bookingPolicyService,
				hotelService,
				bookingsRepository,
				eventEmitter,
			);
		});

		describe('Given the hotel has a valid room', () => {
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
				await hotelService.setRoomType(hotelId, roomType, 5);
			});

			it('should be possible to make a booking', async () => {
				const booking = await bookingService.book(employeeId, hotelId, roomType, checkIn, checkOut);
				expect(booking.employeeId).to.deep.equals(employeeId);
				expect(booking.hotelId).to.deep.equals(hotelId);
				expect(booking.roomType).to.deep.equals(roomType);
				expect(booking.checkIn).to.deep.equals(checkIn);
				expect(booking.checkOut).to.deep.equals(checkOut);
			});
		});

		describe('Given several bookings in the system', () => {
			let employeeId: string;
			let bookings: PlainBooking[];
			let hotelId: string;
			let roomType: string;
			const quantity = 2;

			beforeEach(async () => {
				employeeId = uuid.v4();
				hotelId = uuid.v4();
				roomType = `roomType-${uuid.v4()}`;

				const firstCheckIn = new Date(2020, 4, 3);
				const firstCheckOut = new Date(2020, 4, 6);

				const secondCheckIn = new Date(2020, 4, 6);
				const secondCheckOut = new Date(2020, 4, 7);

				bookings = [
					BookingBuilder.withDatesAndHotelData(
						employeeId,
						hotelId,
						roomType,
						firstCheckIn,
						firstCheckOut,
					).build(),
					BookingBuilder.withDatesAndHotelData(
						employeeId,
						hotelId,
						roomType,
						secondCheckIn,
						secondCheckOut,
					).build(),
				];

				bookingPolicyService.isBookingAllowed.withArgs(employeeId, roomType).resolves(true);
				await hotelService.setRoomType(hotelId, roomType, quantity);
				await Promise.all(
					bookings.map((b) =>
						bookingService.book(b.employeeId, b.hotelId, b.roomType, b.checkIn, b.checkOut),
					),
				);
			});

			it('should not be possible to make a booking that overlaps with others', async () => {
				const checkIn = new Date(2020, 4, 4);
				const checkOut = new Date(2020, 4, 6);
				await expect(
					bookingService.book(employeeId, hotelId, roomType, checkIn, checkOut),
				).to.be.eventually.rejectedWith(Error);
			});
		});
	});

	describe('Given the whole system is up an running', () => {
		let bookingService: BookingService;
		let bookingsRepository: BookingsRepository;

		let bookingPolicyService: BookingPolicyService;
		let bookingPolicyRepository: BookingPolicyRepository;

		let companyService: CompanyService;
		let companyRepository: CompanyRepository;

		let hotelService: HotelService;
		let hotelRepository: HotelRepository;

		let eventEmitter: EventEmitter;

		before(() => {
			eventEmitter = new EventEmitter();
			companyRepository = new InMemoryCompanyRepository();
			companyService = new CompanyService(eventEmitter, companyRepository);

			bookingPolicyRepository = new InMemoryBookinPolicyRepository();
			bookingPolicyService = new BookingPolicyService(
				bookingPolicyRepository,
				companyService,
				eventEmitter,
			);

			hotelRepository = new InMemoryHotelRepository();
			hotelService = new HotelService(hotelRepository);

			bookingsRepository = new InMemoryBookingsRepository();
			bookingService = new BookingService(
				bookingPolicyService,
				hotelService,
				bookingsRepository,
				eventEmitter,
			);
		});

		describe('And a hotel with rooms exists', () => {
			const quantity = 5;
			let hotelId: string;
			let roomType: string;

			beforeEach(async () => {
				hotelId = uuid.v4();
				roomType = `roomType-${uuid.v4()}`;

				await hotelService.setRoomType(hotelId, roomType, quantity);
			});

			describe('And an employee exists', () => {
				let companyId: string;
				let employeeId: string;
				let checkIn: Date;
				let checkOut: Date;

				beforeEach(async () => {
					companyId = uuid.v4();
					employeeId = uuid.v4();
					checkIn = new Date();
					checkOut = new Date(checkIn.getTime() + 555555);

					await companyService.addEmployee(companyId, employeeId);
				});

				it('should be able to make a booking for a single room', async () => {
					const booking = await bookingService.book(
						employeeId,
						hotelId,
						roomType,
						checkIn,
						checkOut,
					);
					expect(omit(['bookingId'], booking)).to.deep.equals({
						employeeId,
						hotelId,
						roomType,
						checkIn,
						checkOut,
					});

					await bookingService.removeBooking(booking.bookingId);
				});

				describe('When the employee has bookings and booking policies and he is removed', () => {
					beforeEach(async () => {
						await bookingPolicyService.setEmployeePolicy(employeeId, [roomType]);
						await bookingService.book(employeeId, hotelId, roomType, checkIn, checkOut);

						await companyService.deleteEmployee(employeeId);
					});

					it('all his policies should be removed', async () => {
						const policies = await bookingPolicyRepository.getByEmployeeId(employeeId);
						expect(policies.isEmpty).to.be.true;
					});

					it('all his bookings should be removed', async () => {
						const employeeBookings = await bookingService.getBookingsForEmployee(employeeId);
						expect(employeeBookings).to.have.lengthOf(0);
					});
				});
			});
		});
	});
});
