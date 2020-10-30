import {expect} from 'chai';
import {BookingPolicyService} from '../../../src/bookingPolicy/BookingPolicyService';
import {BookingPolicyRepository} from '../../../src/bookingPolicy/repositories/BookingPolicyRepository';
import {InMemoryBookinPolicyRepository} from '../../../src/bookingPolicy/repositories/InMemoryBookingPolicyRepository';
import * as sinon from 'ts-sinon';
import {CompanyService} from '../../../src/company/CompanyService';
import {EventEmitter} from 'events';
import * as uuid from 'uuid';

describe('tests/unit/bookingPolicy', () => {
	describe('Given the bookinPolicy service is running', () => {
		let bookingPolicyService: BookingPolicyService;
		let bookingPolicyRepository: BookingPolicyRepository;
		let companyServiceMock: sinon.StubbedInstance<CompanyService>;
		let eventEmitter: EventEmitter;

		let companyId: string;
		let employeeId: string;

		before(() => {
			companyServiceMock = sinon.stubConstructor(CompanyService);
			eventEmitter = new EventEmitter();

			bookingPolicyRepository = new InMemoryBookinPolicyRepository();
			bookingPolicyService = new BookingPolicyService(
				bookingPolicyRepository,
				companyServiceMock,
				eventEmitter,
			);
		});

		beforeEach(() => {
			companyId = uuid.v4();
			employeeId = uuid.v4();

			companyServiceMock.getCompanyForEmployee.withArgs(employeeId).resolves(companyId);
		});

		it('should be possible to create a company booking policy', async () => {
			await bookingPolicyService.setCompanyPolicy(companyId, ['single']);
			const isBookable = await bookingPolicyService.isBookingAllowed(employeeId, 'single');
			expect(isBookable).to.be.true;
		});

		it('should be possible to create a employee booking policy', async () => {
			await bookingPolicyService.setCompanyPolicy(employeeId, ['single']);
			const isBookable = await bookingPolicyService.isBookingAllowed(employeeId, 'single');
			expect(isBookable).to.be.true;

			const isNotBookable = await bookingPolicyService.isBookingAllowed(employeeId, 'double');
			expect(isNotBookable).to.be.false;
		});

		it('a employee with no policies should be able to book any room', async () => {
			const isBookable = await bookingPolicyService.isBookingAllowed(
				uuid.v4(),
				'presidential suite',
			);
			expect(isBookable).to.be.true;
		});

		describe('When an employee deleted event arrives', () => {
			let employeeId2: string;
			beforeEach(async () => {
				await bookingPolicyService.setEmployeePolicy(employeeId2, ['single']);
				eventEmitter.emit(BookingPolicyService.EMPLOYEE_DELETED, employeeId2);
			});

			it('all employee custom policies must be removed', async () => {
				const employeePolicies = await bookingPolicyRepository.getByEmployeeId(employeeId2);
				expect(employeePolicies.isEmpty).to.be.true;
			});
		});
	});
});
