import {Option} from 'ts-option';

export interface BookingPolicy {
	roomTypes: string[];
	policyType: 'company' | 'employee';
}

export interface BookingPolicyRepository {
	save(resourceId: string, bookinPolicy: BookingPolicy): Promise<void>;
	getByCompanyId(companyId: string): Promise<Option<BookingPolicy>>;
	getByEmployeeId(employee: string): Promise<Option<BookingPolicy>>;
	deleteForEmployee(employee: string): Promise<void>;
}
