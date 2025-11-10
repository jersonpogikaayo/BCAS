import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../services/cache/cache.service';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  
  constructor(private cacheService: CacheService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle(request);
    }

    // Skip caching if header is present (prevents infinite loop)
    if (request.headers.has('Skip-Cache') || request.headers.has('Skip-Interceptor')) {
      return next.handle(request);
    }

    // Use cache service to determine if URL should be cached
    if (!this.cacheService.shouldCacheUrl(request.url)) {
      return next.handle(request);
    }

    // Check cache first (only for API endpoints)
    const cachedData = this.cacheService.getCachedData(request.url);
    if (cachedData && cachedData.isValid) {
      console.log(`🎯 Interceptor cache hit for API: ${request.url}`);
      return of(new HttpResponse({
        body: cachedData.data,
        status: 200,
        statusText: 'OK',
        url: request.url
      }));
    }

    // Make HTTP request and cache the response
    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          const cacheTime = request.headers.get('Cache-Time');
          this.cacheService.setCachedData(
            request.url, 
            event.body, 
            cacheTime ? parseInt(cacheTime) : undefined
          );
        }
      })
    );
  }
}