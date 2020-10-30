import {Option} from 'ts-option';

export interface CompanyRepository {
	addEmployee(companyId: string, employeeId: string): Promise<void>;
	deleteEmployee(employeeId: string): Promise<void>;
	getCompanyForEmployee(employeeId: string): Promise<Option<string>>;
}
