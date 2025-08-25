import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

export interface User {
  username: string;
  role?: string;
  token?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  register(data: {
    username: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(credentials: {
    username: string;
    password: string;
  }): Observable<{ access_token: string }> {
    return this.http
      .post<{ access_token: string }>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          const token = response.access_token;
          localStorage.setItem('access_token', token);

          const decoded: any = jwtDecode(token);
          const role = decoded.role;

          const user: User = {
            username: credentials.username,
            token,
            role,
          };
          localStorage.setItem('user', JSON.stringify(user));

          this.currentUserSubject.next(user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getUserRole(): 'admin' | 'customer' | null {
    const role = localStorage.getItem('user_role');
    if (role === 'admin' || role === 'customer') {
      return role;
    }
    return null;
  }
}
