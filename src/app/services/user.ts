import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/all`);
  }

  createUser(userData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, userData);
  }

  approveUser(uid: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/update/${uid}`, { status: 'APPROVED' });
  }

  rejectUser(uid: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/update/${uid}`, { status: 'REJECTED' });
  }

  updateCreditLimit(uid: string, user: User): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/update/${uid}`, user);
  }
}