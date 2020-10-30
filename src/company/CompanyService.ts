import {EventEmitter} from 'events';
import {CompanyRepository} from './repositories/CompanyRepository';

export class CompanyService {
	public static readonly EMPLOYEE_DELETED = 'EmployeDeleted';

	public constructor(
		private readonly eventEmitter: EventEmitter,
		private readonly companyRepository: CompanyRepository,
	) {}

	public async addEmployee(companyId: string, employeeId: string): Promise<void> {
		await this.companyRepository.addEmployee(companyId, employeeId);
	}

	public async deleteEmployee(employeeId: string): Promise<void> {
		await this.companyRepository.deleteEmployee(employeeId);
		this.eventEmitter.emit(CompanyService.EMPLOYEE_DELETED, employeeId);
	}

	public async getCompanyForEmployee(employeeId: string): Promise<string> {
		const company = await this.companyRepository.getCompanyForEmployee(employeeId);
		if (company.isEmpty) {
			throw new Error('Company not found for employee');
		}

		return company.get;
	}
}
