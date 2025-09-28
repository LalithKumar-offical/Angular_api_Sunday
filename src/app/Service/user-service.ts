  import { HttpClient } from '@angular/common/http';
  import { inject, Injectable } from '@angular/core';
  import { Observable } from 'rxjs';
  import { User } from '../Models/Interfaces';
  @Injectable({
    providedIn: 'root'
  })
  export class UserService {
    private http=inject(HttpClient);
    private baseUrl="https://localhost:7076/api/User";

    getAll():Observable<User[]>{
        return this.http.get<User[]>(this.baseUrl);
    }

    getUserById(id:number):Observable<User>{
      return this.http.get<User>(`${this.baseUrl}/User/${id}`);
    }

  createUser(user: User, file?: File): Observable<User> {
    const formData = new FormData();
    formData.append('userId', user.userId.toString());
    formData.append('userName', user.userName);
    formData.append('email', user.email);
    formData.append('password', user.password);
    formData.append('role', "User");
    if (user.pan) formData.append('pan', user.pan);
    if (user.balance) formData.append('balance', user.balance.toString());
    if (file) {
      formData.append('file', file, file.name);
    }
    return this.http.post<User>(this.baseUrl, formData);
}

 getPendingUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/Pending`);
  }

  approveUser(userId: number): Observable<User> {
    const user = { userId, isVerfied: true };
    return this.updateUser(user as User);
  }

  deleteUser(id: number): Observable<User> {
    return this.http.delete<User>(`${this.baseUrl}/${id}`);
  }
  updateUser(user: User, file?: File): Observable<User> {
  const formData = new FormData();
  for (const key in user) {
    const value = user[key as keyof User];
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, value.toString());
    }
  }
  if (file) {
    formData.append('file', file, file.name);
  }
  return this.http.put<User>(this.baseUrl, formData);
  }

  }
