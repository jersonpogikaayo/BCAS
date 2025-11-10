import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';

// Define your data interfaces
export interface DatagridItem {
  id?: number;
  name: string;
  email: string;
  status: string;
  createdAt: Date;
  // Add other properties based on your datagrid columns
}

export interface DatagridState {
  id?: number;
  page: number;
  pageSize: number;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: any;
  lastUpdated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineDatabaseService extends Dexie {
  // Define tables
  datagridItems!: Table<DatagridItem>;
  datagridState!: Table<DatagridState>;

  constructor() {
    super('OfflineDatagridDB');
    
    // Define schemas
    this.version(1).stores({
      datagridItems: '++id, name, email, status, createdAt',
      datagridState: '++id, page, pageSize, sortColumn, sortDirection, lastUpdated'
    }); 
  }

  // Method to clear all data (useful for testing)
  async clearAllData() {
    await this.datagridItems.clear();
    await this.datagridState.clear();
  }

  // Method to get database info
  async getDatabaseInfo() {
    const itemsCount = await this.datagridItems.count();
    const stateCount = await this.datagridState.count();
    
    return {
      itemsCount,
      stateCount,
      isOnline: navigator.onLine
    };
  }
}