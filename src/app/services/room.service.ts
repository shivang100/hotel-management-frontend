import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Room {
  id: number;
  name: string;
  room_type: string;
  description: string;
  price_per_day: number;
  price_per_hour: number;
  main_image: string;
  secondary_images: string[];
}

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private apiUrl = 'http://localhost:5000/api/rooms';

  constructor(private http: HttpClient) {}

  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiUrl);
  }

  createRoom(roomData: Partial<Room>): Observable<Room> {
    return this.http.post<Room>(this.apiUrl, roomData);
  }

  updateRoom(id: number, roomData: Partial<Room>): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${id}`, roomData);
  }

  deleteRoom(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
