import {none, Option, some} from 'ts-option';
import {CompanyRepository} from './CompanyRepository';

export class InMemoryCompanyRepository implements CompanyRepository {
	private companyEmployeesMap: Map<string, string[]>;

	public constructor() {
		this.companyEmployeesMap = new Map<string, string[]>();
	}

	public async addEmployee(companyId: string, employeeId: string): Promise<void> {
		const employees = this.companyEmployeesMap.values();
		for (const employee of employees) {
			if (employee.includes(employeeId)) {
				throw new Error('Employee already exists');
			}
		}

		const companyEmployees = this.companyEmployeesMap.get(companyId) ?? [];
		companyEmployees.push(employeeId);

		this.companyEmployeesMap.set(companyId, companyEmployees);
	}

	public async deleteEmployee(employeeId: string): Promise<void> {
		const companies = this.companyEmployeesMap.keys();
		for (const company of companies) {
			const companyEmployees = this.companyEmployeesMap.get(company);
			if (companyEmployees?.includes(employeeId)) {
				const newEmployees = companyEmployees.filter((e) => e !== employeeId);
				this.companyEmployeesMap.set(company, newEmployees);
				break;
			}
		}
	}

	public async getCompanyForEmployee(employeeId: string): Promise<Option<string>> {
		const companies = this.companyEmployeesMap.keys();
		for (const company of companies) {
			const companyEmployees = this.companyEmployeesMap.get(company);
			if (companyEmployees?.includes(employeeId)) {
				return some(company);
			}
		}

		return none;
	}
}
