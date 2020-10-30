import {Hotel} from '../Hotel';
import {HotelRepository} from '../repositories/HotelRepository';

export interface CreateHotelUseCasePayload {
	hotelId: string;
	roomType: string;
	quantity: number;
}

export class CreateHotelUseCase {
	public constructor(private readonly repository: HotelRepository) {}

	public async handle(payload: CreateHotelUseCasePayload): Promise<void> {
		const hotel = new Hotel(payload.hotelId, [
			{
				roomType: payload.roomType,
				quantity: payload.quantity,
			},
		]);
		await this.repository.save(hotel.toPlainHotel());
	}
}
