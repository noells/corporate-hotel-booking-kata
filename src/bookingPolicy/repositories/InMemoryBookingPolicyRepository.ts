import {option, Option} from 'ts-option';
import {BookingPolicy, BookingPolicyRepository} from './BookingPolicyRepository';

export class InMemoryBookinPolicyRepository implements BookingPolicyRepository {
	private policyBookings: Map<string, BookingPolicy>;

	public constructor() {
		this.policyBookings = new Map<string, BookingPolicy>();
	}

	public async save(resourceId: string, bookinPolicy: BookingPolicy): Promise<void> {
		this.policyBookings.set(resourceId, bookinPolicy);
	}

	public async getByCompanyId(companyId: string): Promise<Option<BookingPolicy>> {
		return this.getResourceBookingPolicy(companyId);
	}

	public async getByEmployeeId(employeeId: string): Promise<Option<BookingPolicy>> {
		return this.getResourceBookingPolicy(employeeId);
	}

	public async deleteForEmployee(employee: string): Promise<void> {
		this.policyBookings.delete(employee);
	}

	private async getResourceBookingPolicy(resourceId: string): Promise<Option<BookingPolicy>> {
		return option(this.policyBookings.get(resourceId));
	}
}
