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
      return this.http.get<User>(`${this.baseUrl}/${id}`);
    }

  createUser(user: User, file?: File): Observable<User> {
    console.log('Creating user:', user);
    const formData = new FormData();
    
    // Only append userId if it exists (for new users, it might be undefined)
    if (user.userId) {
      formData.append('userId', user.userId.toString());
    }
    
    formData.append('userName', user.userName || '');
    formData.append('email', user.email || '');
    formData.append('password', user.password || '');
    formData.append('role', "User");
    
    if (user.pan) formData.append('pan', user.pan);
    if (user.balance) formData.append('balance', user.balance.toString());
    if (file) {
      formData.append('file', file, file.name);
      console.log('File attached:', file.name);
    }
    
    // Debug FormData
    console.log('FormData contents:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
    
    return this.http.post<User>(this.baseUrl, formData);
  }

 getPendingUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/Pending`);
  }

  // Admin-only method to verify user account
  approveUser(user: User): Observable<any> {
    const updatedUser = { ...user, isVerfied: true };
    return this.updateUser(updatedUser);
  }

  // Add balance to user account
updateBalance(userId: number, balance: number): Observable<any> {
  console.log('Updating balance for user:', userId, 'with amount:', balance);
  return this.http.patch(`${this.baseUrl}/balance/${userId}`, balance, {
    headers: { 'Content-Type': 'application/json' }
  });
}

  deleteUser(id: number): Observable<User> {
    return this.http.delete<User>(`${this.baseUrl}/${id}`);
  }
  updateUser(user: User, file?: File): Observable<User> {
    const formData = new FormData();
    
    // Add required fields
    formData.append('userId', user.userId.toString());
    formData.append('userName', user.userName || '');
    formData.append('email', user.email || '');
    formData.append('password', user.password || 'defaultPassword123'); // Backend requires password
    formData.append('role', user.role || 'User');
    formData.append('isVerfied', user.isVerfied ? 'true' : 'false');
    
    // Add optional fields
    if (user.pan) {
      formData.append('pan', user.pan);
      console.log('Adding PAN to FormData:', user.pan);
    }
    
    if (user.balance !== null && user.balance !== undefined) {
      formData.append('balance', user.balance.toString());
    }
    
    if (file) {
      formData.append('file', file, file.name);
      console.log('Adding file to FormData:', file.name);
    }
    
    // Debug FormData contents
    console.log('FormData contents:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
    
    return this.http.put<User>(this.baseUrl, formData);
  }

  }
