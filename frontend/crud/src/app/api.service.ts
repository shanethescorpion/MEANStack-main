import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Photo, User, UserRegister, UserUpdate } from './user';
import { ErrorResponse, SuccessResponse } from './responses';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  apiUrl: string = "/api"

  constructor(private http: HttpClient) { }

  uploadPhoto(photo: Photo) {
    return this.http.post<{ acknowledge: boolean; insertedId?: string; }>(this.apiUrl + '/photos/add', photo);
  }

  addUser(user: UserRegister) {
    return this.http.post<SuccessResponse<User>|ErrorResponse>(this.apiUrl + '/user/add', user);
  }

  verifyUser({ id, username, password }: {id?: string; username?: string; password: string}) {
    return id
      ? this.http.post<boolean>(this.apiUrl + '/user/verify/id/' + id, { password })
      : this.http.post<boolean>(this.apiUrl + '/user/verify/u/' + username, { password })
  }

  getAllUsers() {
    return this.http.get<User[]>(this.apiUrl + '/users')
  }

  getUser({ id, username }: {id?: string; username?: string}) {
    return id
      ? this.http.get<User|null>(this.apiUrl + '/user/id/' + id)
      : this.http.get<User|null>(this.apiUrl + '/user/u/' + username)
  }

  updateUser({ username, id }: { username?: string; id?: string }, body: UserUpdate) {
    return id
      ? this.http.put<SuccessResponse<User>|ErrorResponse>(this.apiUrl + '/user/id/' + id, body)
      : this.http.put<SuccessResponse<User>|ErrorResponse>(this.apiUrl + '/user/u/' + username, body)
  }

  getChatIds(from_user: string) {
    return this.http.get<SuccessResponse<any>|ErrorResponse>(this.apiUrl + '/chat?query=chatids&from_user=' + from_user);
  }

  getChatConversations(id: string, toid: string) {
    return this.http.get<SuccessResponse<any>|ErrorResponse>(this.apiUrl + '/chat?query=conversation&from_user=' + id + '&to_user=' + toid);
  }

  messageChat(id: string, toid: string, message: string) {
    return this.http.post<SuccessResponse<any>|ErrorResponse>(this.apiUrl + '/chat', { id, toid, message });
  }

  deleteMessage(id: string, cid: string) {
    return this.http.delete<SuccessResponse<any>|ErrorResponse>(this.apiUrl + '/chat/' + id + '/' + cid);
  }
}
