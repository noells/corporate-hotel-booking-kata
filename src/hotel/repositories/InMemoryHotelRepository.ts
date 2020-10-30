import {none, Option, some} from 'ts-option';
import {PlainHotel} from '../Hotel';
import {HotelRepository} from './HotelRepository';

export class InMemoryHotelRepository implements HotelRepository {
	private hotels: Map<string, PlainHotel>;

	public constructor() {
		this.hotels = new Map<string, PlainHotel>();
	}

	public async save(hotel: PlainHotel): Promise<void> {
		this.hotels.set(hotel.hotelId, hotel);
	}

	//TODO: change PlainHotel by Hotel
	public async getById(hotelId: string): Promise<Option<PlainHotel>> {
		const hotel = this.hotels.get(hotelId);
		return hotel !== undefined ? some(hotel) : none;
	}
}
