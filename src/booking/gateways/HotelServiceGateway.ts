import {PlainHotel} from '../../hotel/Hotel';
import {HotelService} from '../../hotel/HotelService';

export class HotelServiceGateway {
	private constructor(private readonly hotelService: HotelService) {}

	public static of(hotelService: HotelService): HotelServiceGateway {
		return new HotelServiceGateway(hotelService);
	}

	public async isHotelWithRoomValid(hotelId: string, roomType: string): Promise<boolean> {
		const hotel = await this.hotelService.findHotelById(hotelId);
		return hotel.rooms.some((room) => room.roomType === roomType);
	}

	public async getHotelById(hotelId: string): Promise<PlainHotel> {
		return this.hotelService.findHotelById(hotelId);
	}
}
