import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WinnerService {
  private apiUrl = `${environment.apiUrl}/winners`;

  constructor(private http: HttpClient) {}

  saveWinner(winner: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, winner).pipe(
        retry(3), // Retry up to 3 times before failing
        catchError(this.handleError)
    );
  }

  getWinners(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  
  resetAll(): Observable<any[]> {
    return this.http.delete<any[]>(this.apiUrl).pipe(
      retry(3), // Retry up to 3 times before failing
      catchError(this.handleError)
    );
  }
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Something went wrong; please try again later.';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server-side error: ${error.status} - ${error.message || 'Unknown Error'} (URL: ${error.url})`;
    }
    console.error('Error details:', errorMessage, 'Full error:', error); // Log detailed error to console
    return throwError(() => new Error(errorMessage));
  }
}
