export interface Room {
	roomType: string;
	quantity: number;
}

export interface PlainHotel {
	hotelId: string;
	rooms: Room[];
}

export class Hotel {
	public constructor(private readonly hotelId: string, private rooms: Room[] = []) {}

	public static fromPlainHotel(plainHotel: PlainHotel): Hotel {
		const hotel = new Hotel(plainHotel.hotelId, plainHotel.rooms);
		return hotel;
	}

	public setRoom(room: Room): void {
		if (this.rooms.some((r) => r.roomType === room.roomType)) {
			this.rooms = [...this.rooms.filter((r) => r.roomType !== room.roomType), room];
		} else {
			this.rooms.push(room);
		}
	}

	public toPlainHotel(): PlainHotel {
		return {
			hotelId: this.hotelId,
			rooms: this.rooms,
		};
	}
}
