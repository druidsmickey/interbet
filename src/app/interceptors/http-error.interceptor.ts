import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred.';
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Client-side error: ${error.error.message}`;
        } else {
          errorMessage = `Server-side error: ${error.status} - ${error.message || 'Unknown Error'}`;
        }
        console.error('HTTP Error Interceptor:', errorMessage, 'Full error:', error);
        if (error.status === 0) {
          console.error('Network error: Unable to reach the server. Please check your connection or server status.');
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
