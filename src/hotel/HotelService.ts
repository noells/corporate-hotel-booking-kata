import {PlainHotel} from './Hotel';
import {HotelRepository} from './repositories/HotelRepository';
import {CreateHotelUseCase} from './useCases/CreateHotelUseCase';
import {SetRoomTypeUseCase} from './useCases/SetRoomTypeUseCase';

interface HotelServiceUseCases {
	setRoomType: SetRoomTypeUseCase;
	createHotel: CreateHotelUseCase;
}

export class HotelService {
	private repository: HotelRepository;
	private useCases: HotelServiceUseCases;

	public constructor(repository: HotelRepository) {
		this.repository = repository;
		this.useCases = {
			setRoomType: new SetRoomTypeUseCase(this.repository),
			createHotel: new CreateHotelUseCase(this.repository),
		};
	}

	public async setRoomType(hotelId: string, roomType: string, quantity: number): Promise<void> {
		const payload = {
			hotelId,
			roomType,
			quantity,
		};
		return (await this.existsHotel(hotelId))
			? this.useCases.setRoomType.handle(payload)
			: this.useCases.createHotel.handle(payload);
	}

	public async findHotelById(hotelId: string): Promise<PlainHotel> {
		const hotel = await this.repository.getById(hotelId);
		if (hotel.isEmpty) {
			throw new Error(`Hotel with id ${hotelId} not found`);
		}

		return hotel.get;
	}

	private async existsHotel(hotelId: string): Promise<boolean> {
		return (await this.repository.getById(hotelId)).isDefined;
	}
}
