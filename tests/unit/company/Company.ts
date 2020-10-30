import {EventEmitter} from 'events';
import {CompanyService} from '../../../src/company/CompanyService';
import * as uuid from 'uuid';
import * as sinon from 'ts-sinon';
import {CompanyRepository} from '../../../src/company/repositories/CompanyRepository';
import {none, some} from 'ts-option';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('tests/unit/company/Company', () => {
	describe('Given the CompanyService is running', () => {
		let companyService: CompanyService;
		let eventEmitterMock: sinon.StubbedInstance<EventEmitter>;
		let repositoryMock: sinon.StubbedInstance<CompanyRepository>;

		let companyId: string;
		let employeeId: string;

		before(() => {
			eventEmitterMock = sinon.stubConstructor(EventEmitter);
			repositoryMock = sinon.stubInterface<CompanyRepository>();
			companyService = new CompanyService(eventEmitterMock, repositoryMock);
		});

		beforeEach(() => {
			sinon.default.reset();
			companyId = uuid.v4();
			employeeId = uuid.v4();
		});

		it('should be possible to add an employee', async () => {
			await companyService.addEmployee(companyId, employeeId);
			sinon.default.assert.calledOnce(repositoryMock.addEmployee);
			sinon.default.assert.calledWith(repositoryMock.addEmployee, companyId, employeeId);
		});

		describe('When a employee is deleted', () => {
			beforeEach(async () => {
				await companyService.deleteEmployee(employeeId);
			});

			it('should delegate the removal on the repo', async () => {
				sinon.default.assert.calledOnce(repositoryMock.deleteEmployee);
				sinon.default.assert.calledWith(repositoryMock.deleteEmployee, employeeId);
			});

			it('should emit a EMPLOYEE_DELETED event', async () => {
				sinon.default.assert.calledOnce(eventEmitterMock.emit);
				sinon.default.assert.calledWith(
					eventEmitterMock.emit,
					CompanyService.EMPLOYEE_DELETED,
					employeeId,
				);
			});
		});

		describe('When trying to get the company for an employee', () => {
			let randomEmployee: string;
			beforeEach(() => {
				repositoryMock.getCompanyForEmployee.withArgs(randomEmployee).resolves(none);
				repositoryMock.getCompanyForEmployee.withArgs(employeeId).resolves(some(companyId));
			});

			it('should throw an error if no company has been found', async () => {
				await expect(
					companyService.getCompanyForEmployee(randomEmployee),
				).to.be.eventually.rejectedWith(Error);
			});

			it('should be possible to get company for existing employee', async () => {
				const company = await companyService.getCompanyForEmployee(employeeId);
				expect(company).to.equals(companyId);
			});
		});
	});
});
