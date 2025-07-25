import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private apiUrl = 'http://localhost:3000/items'; // Ensure this matches the server configuration

  constructor(private http: HttpClient) {}
  
  getItems(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      retry(3), // Retry up to 3 times before failing
      catchError(this.handleError)
    );
  }

  addItem(item: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, item).pipe(
      retry(3), // Retry up to 3 times before failing
      catchError(this.handleError)
    );
  }

  resetAll(): Observable<any[]> {
    return this.http.delete<any[]>(this.apiUrl).pipe(
      retry(3), // Retry up to 3 times before failing
      catchError(this.handleError)
    );
  }
  cancelItem(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, { cancel: 1 }); // Use PUT instead of POST
  }

  updateItemSpecial( id: string, special: number) {
    return this.http.put(`${this.apiUrl}/special/${id}`, { special: 1 }); // Use PUT instead of POST
  }

  cancelSpecial( id: string, special: number) {
    return this.http.put(`${this.apiUrl}/cancelspecial/${id}`, { special: 0 }); // Use PUT instead of POST
  }
  updateCancelStatus(id: string, cancel: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, { cancel }).pipe(
      catchError(this.handleError)
    );
  }

  saveData(item: any): Observable<any> {
    return this.http.put(this.apiUrl, item).pipe(
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
