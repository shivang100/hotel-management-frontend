import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, map, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

export interface User {
  id?: number;
  username?: string;
  email?: string;
  role?: string;
  token?: string; // access token
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Match Flask port (5001)
  private apiUrl = 'http://localhost:5001/api/auth';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // ---- Storage helpers ----
  private saveUser(user: User, refresh?: string) {
    localStorage.setItem('user', JSON.stringify(user));
    if (user.token) localStorage.setItem('token', user.token);
    if (refresh) localStorage.setItem('refresh_token', refresh);
    if (user.role) localStorage.setItem('role', user.role);
    this.currentUserSubject.next(user);
  }

  getUser(): User | null {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  }
  getUserId(): number | null {
    return this.getUser()?.id ?? null;
  }
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }
  getUserRole(): string | null {
    return localStorage.getItem('role');
  }

  // ---- Auth API ----
  register(data: {
    username: string;
    email: string;
    password: string;
  }): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}/register`, data).pipe(
      map((res) => {
        const access = res.access_token as string;
        const refresh = res.refresh_token as string;
        if (!access || !refresh) throw new Error('Invalid register response');

        const decoded: any = jwtDecode(access);
        const user: User = {
          id: decoded?.sub ? Number(decoded.sub) : res.user?.id,
          username: res.user?.username ?? data.username,
          email: res.user?.email ?? decoded?.email,
          role: res.user?.role ?? decoded?.role,
          token: access,
        };
        this.saveUser(user, refresh);
        return user;
      })
    );
  }

  login(credentials: { username: string; password: string }): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      map((res) => {
        const access = res.access_token as string;
        const refresh = res.refresh_token as string;
        if (!access || !refresh) throw new Error('Invalid login response');

        const decoded: any = jwtDecode(access);
        const user: User = {
          id: decoded?.sub ? Number(decoded.sub) : res.user?.id,
          username: res.user?.username ?? credentials.username,
          email: res.user?.email ?? decoded?.email,
          role: res.user?.role ?? decoded?.role,
          token: access,
        };
        this.saveUser(user, refresh);
        return user;
      })
    );
  }

  refreshAccessToken(): Observable<string> {
    const refresh = this.getRefreshToken();
    if (!refresh) return throwError(() => new Error('No refresh token'));

    const headers = new HttpHeaders({ Authorization: `Bearer ${refresh}` });
    return this.http.post<any>(`${this.apiUrl}/refresh`, {}, { headers }).pipe(
      map((res) => {
        const newAccess = res.access_token as string;
        if (!newAccess) throw new Error('Invalid refresh response');

        const u = this.getUser();
        const decoded: any = jwtDecode(newAccess);
        const updated: User = {
          ...(u ?? {}),
          id: decoded?.sub ? Number(decoded.sub) : u?.id,
          email: decoded?.email ?? u?.email,
          role: decoded?.role ?? u?.role,
          token: newAccess,
        };
        this.saveUser(updated); // keep existing refresh token
        return newAccess;
      })
    );
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('role');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
