import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor() { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    request = this.addToken(request);
    return next.handle(request).pipe(catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return this.handle401Error(request, next);
      } 
      else {
        console.log("error")
        return throwError(error);
      }
    }));
  }

  private addToken(request: HttpRequest<any>) {
    const Url="https://infinite-taiga-94128.herokuapp.com/"+request.url.replace("https://infinite-taiga-94128.herokuapp.com/", "");
    return request.clone({
      url: Url,
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
     return next.handle(this.addToken(request));
  }
}