import {EventEmitter} from 'events';
import {CompanyService} from '../company/CompanyService';
import {CompanyServiceGateway} from './gateways/CompanyServiceGateway';
import {BookingPolicyRepository} from './repositories/BookingPolicyRepository';

export class BookingPolicyService {
	public static readonly EMPLOYEE_DELETED = 'EmployeDeleted';

	private repository: BookingPolicyRepository;
	private companyServiceGateway: CompanyServiceGateway;
	private eventEmitter: EventEmitter;

	public constructor(
		repository: BookingPolicyRepository,
		companyService: CompanyService,
		eventEmitter: EventEmitter,
	) {
		this.repository = repository;
		this.companyServiceGateway = CompanyServiceGateway.from(companyService);
		this.eventEmitter = eventEmitter;

		this.eventEmitter.on(BookingPolicyService.EMPLOYEE_DELETED, this.onEmployeeDeleted.bind(this));
	}

	public async setCompanyPolicy(companyId: string, roomTypes: string[]): Promise<void> {
		await this.repository.save(companyId, {
			policyType: 'company',
			roomTypes,
		});
	}

	public async setEmployeePolicy(employeeId: string, roomTypes: string[]): Promise<void> {
		await this.repository.save(employeeId, {
			policyType: 'employee',
			roomTypes,
		});
	}

	public async isBookingAllowed(employeeId: string, roomType: string): Promise<boolean> {
		const employeePolicy = await this.repository.getByEmployeeId(employeeId);
		if (employeePolicy.isDefined) {
			return employeePolicy.get.roomTypes.includes(roomType);
		}

		const companyId = await this.companyServiceGateway.getEmployeeCompany(employeeId);

		const companyPolicy = await this.repository.getByCompanyId(companyId);
		return companyPolicy.isDefined ? companyPolicy.get.roomTypes.includes(roomType) : true;
	}

	private async onEmployeeDeleted(employeeId: string): Promise<void> {
		await this.repository.deleteForEmployee(employeeId);
	}
}
