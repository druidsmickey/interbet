import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor'; // Import the interceptor

@NgModule({
  declarations: [
    

  ],
  imports: [
    BrowserModule,
    RouterModule,
    HttpClientModule, // Add HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true } // Register the interceptor
  ],
  bootstrap: []
})
export class AppModule { }
