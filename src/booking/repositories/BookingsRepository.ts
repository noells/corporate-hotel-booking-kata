import {Option} from 'ts-option';
import {PlainBooking} from '../Booking';

export interface BookingsRepository {
	save(booking: PlainBooking): Promise<void>;
	getBookings(): Promise<PlainBooking[]>;
	getBookingsForEmployee(employeeId: string): Promise<PlainBooking[]>;
	delete(bookingId: string): Promise<void>;
	getByHotelId(hotelId: string): Promise<Option<PlainBooking[]>>;
	deleteEmployeeBookings(employeeId: string): Promise<void>;
}
