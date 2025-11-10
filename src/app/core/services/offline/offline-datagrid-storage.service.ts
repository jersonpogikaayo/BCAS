// src/app/core/services/offline/offline-datagrid-storage.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CachedGridData {
  data: any;
  timestamp: number;
  params: any;
  isEngineer: boolean;
  totalCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineDataGridStorageService {
  private db: IDBDatabase | null = null;
  private dbName = 'AIDentalDataGridDB';
  private dbVersion = 1;
  
  // Network status
  private isOfflineSubject = new BehaviorSubject<boolean>(!navigator.onLine);
  public isOffline$ = this.isOfflineSubject.asObservable();

  constructor() {
    this.initDB();
    this.monitorNetworkStatus();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('gridData')) {
          const gridStore = db.createObjectStore('gridData', { keyPath: 'id' });
          gridStore.createIndex('paramsHash', 'paramsHash');
          gridStore.createIndex('timestamp', 'timestamp');
          gridStore.createIndex('isEngineer', 'isEngineer');
        }

        if (!db.objectStoreNames.contains('gridCounts')) {
          const countStore = db.createObjectStore('gridCounts', { keyPath: 'id' });
          countStore.createIndex('paramsHash', 'paramsHash');
          countStore.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  private monitorNetworkStatus(): void {
    window.addEventListener('online', () => {
      this.isOfflineSubject.next(false);
    });

    window.addEventListener('offline', () => {
      this.isOfflineSubject.next(true);
    });
  }

  // Generate unique key for parameters
  private generateParamsHash(params: any, isEngineer: boolean): string {
    const sortedParams = Object.keys(params).sort().reduce((obj: any, key) => {
      obj[key] = params[key];
      return obj;
    }, {});
    
    return btoa(JSON.stringify({ ...sortedParams, isEngineer }));
  }

  // Store grid data
  async storeGridData(params: any, data: any, isEngineer: boolean): Promise<void> {
    if (!this.db) await this.initDB();

    const paramsHash = this.generateParamsHash(params, isEngineer);
    const cachedData: CachedGridData = {
      data,
      timestamp: Date.now(),
      params,
      isEngineer
    };

    const transaction = this.db!.transaction(['gridData'], 'readwrite');
    const store = transaction.objectStore('gridData');
    
    await store.put({
      id: paramsHash,
      paramsHash,
      ...cachedData
    });
  }

  // Store grid count
  async storeGridCount(params: any, count: number, isEngineer: boolean): Promise<void> {
    if (!this.db) await this.initDB();

    const paramsHash = this.generateParamsHash(params, isEngineer);
    
    const transaction = this.db!.transaction(['gridCounts'], 'readwrite');
    const store = transaction.objectStore('gridCounts');
    
    await store.put({
      id: paramsHash,
      paramsHash,
      count,
      timestamp: Date.now(),
      params,
      isEngineer
    });
  }

  // Get cached grid data
  async getCachedGridData(params: any, isEngineer: boolean, maxAge: number = 300000): Promise<any | null> {
    if (!this.db) await this.initDB();

    const paramsHash = this.generateParamsHash(params, isEngineer);
    
    const transaction = this.db!.transaction(['gridData'], 'readonly');
    const store = transaction.objectStore('gridData');
    const request = store.get(paramsHash);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        
        if (!result) {
          resolve(null);
          return;
        }

        // Check if data is still fresh (default 5 minutes)
        const isExpired = (Date.now() - result.timestamp) > maxAge;
        
        if (isExpired && navigator.onLine) {
          resolve(null); // Force refresh if online and expired
        } else {
          resolve(result.data);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Get cached grid count
  async getCachedGridCount(params: any, isEngineer: boolean, maxAge: number = 300000): Promise<number | null> {
    if (!this.db) await this.initDB();

    const paramsHash = this.generateParamsHash(params, isEngineer);
    
    const transaction = this.db!.transaction(['gridCounts'], 'readonly');
    const store = transaction.objectStore('gridCounts');
    const request = store.get(paramsHash);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        
        if (!result) {
          resolve(null);
          return;
        }

        const isExpired = (Date.now() - result.timestamp) > maxAge;
        
        if (isExpired && navigator.onLine) {
          resolve(null);
        } else {
          resolve(result.count);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Clear old cache entries
  async clearExpiredCache(maxAge: number = 86400000): Promise<void> { // Default 24 hours
    if (!this.db) await this.initDB();

    const cutoffTime = Date.now() - maxAge;
    
    // Clear expired grid data
    const gridTransaction = this.db!.transaction(['gridData'], 'readwrite');
    const gridStore = gridTransaction.objectStore('gridData');
    const gridIndex = gridStore.index('timestamp');
    const gridRange = IDBKeyRange.upperBound(cutoffTime);

    await new Promise<void>((resolve, reject) => {
      const request = gridIndex.openCursor(gridRange);
      request.onerror = () => reject(request.error);
      request.onsuccess = function (event: any) {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
    });

    // Clear expired count data
    const countTransaction = this.db!.transaction(['gridCounts'], 'readwrite');
    const countStore = countTransaction.objectStore('gridCounts');
    const countIndex = countStore.index('timestamp');

    await new Promise<void>((resolve, reject) => {
      const request = countIndex.openCursor(gridRange);
      request.onerror = () => reject(request.error);
      request.onsuccess = function (event: any) {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }

  // Get all cached data (for debugging)
  async getAllCachedData(): Promise<any[]> {
    if (!this.db) await this.initDB();

    const transaction = this.db!.transaction(['gridData'], 'readonly');
    const store = transaction.objectStore('gridData');
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all cache
  async clearAllCache(): Promise<void> {
    if (!this.db) await this.initDB();

    const transaction = this.db!.transaction(['gridData', 'gridCounts'], 'readwrite');
    
    await transaction.objectStore('gridData').clear();
    await transaction.objectStore('gridCounts').clear();
  }
}