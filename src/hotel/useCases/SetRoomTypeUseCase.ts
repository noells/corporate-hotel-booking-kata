import {Hotel, PlainHotel} from '../Hotel';
import {HotelRepository} from '../repositories/HotelRepository';

export interface SetRoomTypeUseCasePayload {
	hotelId: string;
	roomType: string;
	quantity: number;
}

export class SetRoomTypeUseCase {
	public constructor(private readonly repository: HotelRepository) {}

	public async handle(payload: SetRoomTypeUseCasePayload): Promise<void> {
		const plainHotel = (await this.repository.getById(payload.hotelId)).get as PlainHotel;

		const hotel = Hotel.fromPlainHotel(plainHotel);
		hotel.setRoom({
			roomType: payload.roomType,
			quantity: payload.quantity,
		});

		await this.repository.save(hotel.toPlainHotel());
	}
}
