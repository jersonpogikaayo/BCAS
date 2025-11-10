import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface CacheEntry {
  url: string;
  data: any;
  timestamp: number;
  expiry: number;
  size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TIME = 5 * 60 * 1000; // 5 minutes

  // URLs that should be cached (API endpoints only)
  private cacheablePatterns: RegExp[] = [
  ];

  // URLs that should NOT be cached
  private excludedPatterns = [
    /^assets\//,              // Static assets (already cached by browser)
    /^\/api\/auth/,           // Authentication endpoints
    /^\/api\/user\/profile/,  // Current user profile (changes frequently)
    /^\/api\/logs/,           // Log data
    /^\/api\/audit/           // Audit trails
  ];

  constructor(private http: HttpClient) {
    // Make cache visible in DevTools
    (window as any).appCache = {
      cache: this.cache,
      stats: () => this.getCacheStats(),
      clear: () => this.clearCache(),
      get: (key: string) => this.cache.get(key),
      keys: () => Array.from(this.cache.keys()),
      size: () => this.cache.size,
      shouldCache: (url: string) => this.shouldCacheUrl(url)
    };
    
    console.log('🚀 Cache service initialized. Static files excluded from caching.');
    console.log('💡 Use window.appCache in DevTools to inspect cache');
  }

  /**
   * Check if URL should be cached
   */
  shouldCacheUrl(url: string): boolean {
    // First check if URL should be excluded
    if (this.excludedPatterns.some(pattern => pattern.test(url))) {
      console.log(`🚫 URL excluded from caching: ${url}`);
      return false;
    }

    // Then check if URL matches cacheable patterns
    const shouldCache = this.cacheablePatterns.some(pattern => pattern.test(url));
    
    if (!shouldCache) {
      console.log(`⏭️ URL not in cacheable patterns: ${url}`);
    }
    
    return shouldCache;
  }

  /**
   * Get data from cache or make HTTP request (for API endpoints only)
   */
  get<T>(url: string, options?: {
    forceRefresh?: boolean;
    cacheTime?: number;
    skipCache?: boolean;
  }): Observable<T> {
    
    // Don't cache if URL is not in cacheable patterns
    if (!this.shouldCacheUrl(url)) {
      console.log(`🌐 Direct HTTP request (not cacheable): ${url}`);
      return this.http.get<T>(url);
    }

    const cacheKey = this.generateCacheKey(url);
    const cacheTime = options?.cacheTime || this.CACHE_TIME;

    console.log(`🔍 Cache request for API: ${url}`);

    // Skip cache if requested
    if (options?.skipCache) {
      console.log(`⏭️ Skipping cache for: ${url}`);
      return this.makeHttpRequest<T>(url, cacheKey, cacheTime);
    }

    // Force refresh if requested
    if (options?.forceRefresh) {
      console.log(`🔄 Force refresh for: ${url}`);
      this.cache.delete(cacheKey);
      return this.makeHttpRequest<T>(url, cacheKey, cacheTime);
    }

    // Check if data exists in cache and is still valid
    const cachedData = this.cache.get(cacheKey);
    if (cachedData && this.isValid(cachedData)) {
      console.log(`✅ Cache HIT for API: ${url}`, cachedData);
      return of(cachedData.data);
    }

    if (cachedData && !this.isValid(cachedData)) {
      console.log(`⚠️ Cache EXPIRED for API: ${url}`, cachedData);
    } else {
      console.log(`❌ Cache MISS for API: ${url}`);
    }

    // Make HTTP request and cache the result
    return this.makeHttpRequest<T>(url, cacheKey, cacheTime);
  }

  /**
   * Get cached data directly (for interceptor use)
   */
  getCachedData<T>(url: string): { data: T; isValid: boolean } | null {
    const cacheKey = this.generateCacheKey(url);
    const cachedData = this.cache.get(cacheKey);
    
    if (cachedData) {
      const isValid = this.isValid(cachedData);
      console.log(`🔍 Direct cache check for ${url}: ${isValid ? 'VALID' : 'EXPIRED'}`);
      return {
        data: cachedData.data,
        isValid
      };
    }
    
    console.log(`❌ No cached data for: ${url}`);
    return null;
  }

  /**
   * Set data in cache
   */
  setCachedData<T>(url: string, data: T, cacheTime?: number): void {
    const cacheKey = this.generateCacheKey(url);
    const expiry = cacheTime || this.CACHE_TIME;
    const cacheEntry: CacheEntry = {
      url,
      data,
      timestamp: Date.now(),
      expiry,
      size: this.calculateSize(data)
    };
    
    this.cache.set(cacheKey, cacheEntry);
    console.log(`💾 Data cached for: ${url}`, {
      size: cacheEntry.size,
      expiresIn: expiry,
      totalCacheSize: this.cache.size
    });
    
    // Also store in sessionStorage for persistence during session
    try {
      sessionStorage.setItem(`cache_${cacheKey}`, JSON.stringify(cacheEntry));
    } catch (e) {
      console.warn('Failed to store in sessionStorage:', e);
    }
  }

  getCacheStats(): any {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      url: entry.url,
      type: this.getUrlType(entry.url),
      timestamp: new Date(entry.timestamp).toISOString(),
      isValid: this.isValid(entry),
      ageInMinutes: Math.round((Date.now() - entry.timestamp) / 60000),
      size: entry.size || 0
    }));

    const totalSize = entries.reduce((sum, entry) => sum + (entry.size || 0), 0);
    const validEntries = entries.filter(e => e.isValid).length;

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries: this.cache.size - validEntries,
      totalSizeKB: Math.round(totalSize / 1024),
      apiEntriesOnly: true, // Indicates only API data is cached
      entries
    };
  }

  private getUrlType(url: string): string {
    if (url.includes('/api/jobs')) return 'Jobs API';
    if (url.includes('/api/users')) return 'Users API';
    if (url.includes('/api/dashboard')) return 'Dashboard API';
    if (url.includes('/api/reference-data')) return 'Reference API';
    return 'Other API';
  }

  private makeHttpRequest<T>(url: string, cacheKey: string, cacheTime?: number): Observable<T> {
    console.log(`🌐 Making HTTP request to: ${url}`);
    
    // Add header to skip cache interceptor to prevent infinite loop
    return this.http.get<T>(url, { 
      headers: { 'Skip-Cache': 'true' } 
    }).pipe(
      tap(response => {
        this.setCachedData(url, response, cacheTime);
      }),
      catchError(error => {
        console.error(`❌ HTTP request failed for: ${url}`, error);
        return throwError(error);
      })
    );
  }

  private generateCacheKey(url: string): string {
    return btoa(url).replace(/[^a-zA-Z0-9]/g, '_');
  }

  private isValid(cachedData: CacheEntry): boolean {
    const now = Date.now();
    return (now - cachedData.timestamp) < cachedData.expiry;
  }

  private calculateSize(data: any): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }

  clearCache(): void {
    console.log(`🗑️ Clearing cache (${this.cache.size} entries)`);
    this.cache.clear();
    
    // Also clear sessionStorage cache
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('cache_')) {
        sessionStorage.removeItem(key);
      }
    });
  }

  // Debug methods
  logCacheContents(): void {
    console.group('📊 Cache Contents');
    const stats = this.getCacheStats();
    console.table(stats.entries);
    console.log('Cache Stats:', {
      totalEntries: stats.totalEntries,
      validEntries: stats.validEntries,
      expiredEntries: stats.expiredEntries,
      totalSizeKB: stats.totalSizeKB
    });
    console.groupEnd();
  }
}