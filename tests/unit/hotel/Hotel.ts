import {HotelService} from '../../../src/hotel/HotelService';
import {HotelRepository} from '../../../src/hotel/repositories/HotelRepository';
import {InMemoryHotelRepository} from '../../../src/hotel/repositories/InMemoryHotelRepository';
import * as uuid from 'uuid';
import {expect} from 'chai';
import {Hotel} from '../../../src/hotel/Hotel';

describe('tests/unit/hotel/Hotel', () => {
	describe('Given the hotel service is running', () => {
		let hotelService: HotelService;
		let repository: HotelRepository;

		before(() => {
			repository = new InMemoryHotelRepository();
			hotelService = new HotelService(repository);
		});

		describe('Given no hotels exist', () => {
			it('should be possible create a new one', async () => {
				const hotelId = uuid.v4();
				const roomType = `roomType-${uuid.v4()}`;
				const quantity = 5;

				await hotelService.setRoomType(hotelId, roomType, quantity);

				const hotel = await hotelService.findHotelById(hotelId);

				const expectedHotel = new Hotel(hotelId, [{roomType, quantity}]);
				expect(hotel).to.deep.equals(expectedHotel.toPlainHotel());
			});

			it('should throw an Error if we try to find a hotel', async () => {
				const hotelId = uuid.v4();
				await expect(hotelService.findHotelById(hotelId)).to.be.eventually.rejectedWith(Error);
			});
		});

		describe('Given a hotel exists', () => {
			let hotel: Hotel;
			let hotelId: string;
			beforeEach(async () => {
				hotelId = uuid.v4();
				hotel = new Hotel(hotelId, [
					{
						roomType: `roomType-${uuid.v4()}`,
						quantity: 5,
					},
				]);

				await repository.save(hotel.toPlainHotel());
			});

			it('should be possible to set a new room type', async () => {
				const roomType = 'newRoomType';
				const quantity = 69;

				await hotelService.setRoomType(hotelId, roomType, quantity);

				const updatedHotel = await hotelService.findHotelById(hotelId);
				const rooms = updatedHotel.rooms;

				const expectedRooms = [...hotel.toPlainHotel().rooms, {roomType, quantity}];
				expect(rooms).to.have.deep.members(expectedRooms);
			});

			it('should be possible to update an existing roomType', async () => {
				const roomType = hotel.toPlainHotel().rooms[0].roomType;
				const quantity = 15;

				await hotelService.setRoomType(hotelId, roomType, quantity);

				const updatedHotel = await hotelService.findHotelById(hotelId);
				const rooms = updatedHotel.rooms;

				const expectedRooms = [{roomType, quantity}];
				expect(rooms).to.have.deep.members(expectedRooms);
			});
		});
	});
});
