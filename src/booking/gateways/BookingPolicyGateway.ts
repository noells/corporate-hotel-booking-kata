import {BookingPolicyService} from '../../bookingPolicy/BookingPolicyService';

export class BookingPolicyGateway {
	private constructor(private readonly bookingPolicyService: BookingPolicyService) {}

	public static of(bookingPolicyService: BookingPolicyService): BookingPolicyGateway {
		return new BookingPolicyGateway(bookingPolicyService);
	}

	public async isBookingAllowed(employeeId: string, roomType: string): Promise<boolean> {
		return this.bookingPolicyService.isBookingAllowed(employeeId, roomType);
	}
}
