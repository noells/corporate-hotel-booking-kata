import {Option} from 'ts-option';
import {PlainHotel} from '../Hotel';

export interface HotelRepository {
	save(hotel: PlainHotel): Promise<void>;
	getById(hotelId: string): Promise<Option<PlainHotel>>;
}
