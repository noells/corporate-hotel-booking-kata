import {CompanyService} from '../../company/CompanyService';

export class CompanyServiceGateway {
	private constructor(private readonly companyService: CompanyService) {}

	public static from(companyService: CompanyService): CompanyServiceGateway {
		return new CompanyServiceGateway(companyService);
	}

	public getEmployeeCompany(employeeId: string): Promise<string> {
		return this.companyService.getCompanyForEmployee(employeeId);
	}
}
