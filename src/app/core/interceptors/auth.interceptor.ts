import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);

  constructor(private auth: AuthService) {}

  private withAuth(req: HttpRequest<any>, token: string | null) {
    if (!token) return req;
    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    const authReq = this.withAuth(req, token);

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Only try refresh on 401
        if (error.status === 401) {
          return this.handle401(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshSubject.next(null);

      return this.auth.refreshAccessToken().pipe(
        switchMap((newToken) => {
          this.isRefreshing = false;
          this.refreshSubject.next(newToken);
          return next.handle(this.withAuth(req, newToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.auth.logout(); // optional: force logout on refresh failure
          return throwError(() => err);
        })
      );
    } else {
      // Queue requests until refresh completes
      return this.refreshSubject.asObservable().pipe(
        filter((t) => t != null),
        take(1),
        switchMap((t) => next.handle(this.withAuth(req, t)))
      );
    }
  }
}
