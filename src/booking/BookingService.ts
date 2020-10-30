import {EventEmitter} from 'events';
import {BookingPolicyService} from '../bookingPolicy/BookingPolicyService';
import {HotelService} from '../hotel/HotelService';
import {PlainBooking} from './Booking';
import {BookingManager} from './BookingManager';
import {BookingPolicyGateway} from './gateways/BookingPolicyGateway';
import {HotelServiceGateway} from './gateways/HotelServiceGateway';
import {BookingsRepository} from './repositories/BookingsRepository';

export class BookingService {
	public static readonly EMPLOYEE_DELETED = 'EmployeDeleted';
	private static readonly DAY_IN_MS = 24 * 60 * 60 * 1000;

	private bookingPolicyGateway: BookingPolicyGateway;
	private hotelServiceGateway: HotelServiceGateway;
	private bookingManager: BookingManager;
	private eventEmitter: EventEmitter;

	public constructor(
		bookingPolicyService: BookingPolicyService,
		hotelService: HotelService,
		repository: BookingsRepository,
		eventEmitter: EventEmitter,
	) {
		this.bookingPolicyGateway = BookingPolicyGateway.of(bookingPolicyService);
		this.hotelServiceGateway = HotelServiceGateway.of(hotelService);
		this.bookingManager = new BookingManager(repository);
		this.eventEmitter = eventEmitter;

		this.eventEmitter.on(BookingService.EMPLOYEE_DELETED, this.onEmployeeDeleted.bind(this));
	}

	public async book(
		employeeId: string,
		hotelId: string,
		roomType: string,
		checkIn: Date,
		checkOut: Date,
	): Promise<PlainBooking> {
		this.areDatesCorrect(checkIn, checkOut);

		const [isHotelValid, isBookingAllowed] = await Promise.all([
			this.hotelServiceGateway.isHotelWithRoomValid(hotelId, roomType),
			this.bookingPolicyGateway.isBookingAllowed(employeeId, roomType),
		]);

		if (!isHotelValid || !isBookingAllowed) {
			throw new Error('It is not possible to make the booking');
		}

		const hotel = await this.hotelServiceGateway.getHotelById(hotelId);
		return this.bookingManager.makeBooking(employeeId, hotel, roomType, checkIn, checkOut);
	}

	public async getBookings(): Promise<PlainBooking[]> {
		return this.bookingManager.getBookings();
	}

	public async getBookingsForEmployee(employeeId: string): Promise<PlainBooking[]> {
		return this.bookingManager.getBookingsForEmployee(employeeId);
	}

	public async removeBooking(bookingId: string): Promise<void> {
		await this.bookingManager.removeBooking(bookingId);
	}

	private async onEmployeeDeleted(employeeId: string): Promise<void> {
		await this.bookingManager.deleteBookingsForEmployee(employeeId);
	}

	private areDatesCorrect(checkIn: Date, checkOut: Date): boolean {
		return checkOut.getTime() - BookingService.DAY_IN_MS >= checkIn.getTime();
	}
}
