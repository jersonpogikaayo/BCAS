import { Injectable } from '@angular/core';
import { ColumnHeaderModel } from '../../models/common-datagrid/common-data-grid.model';

@Injectable({
  providedIn: 'root'
})
export class CommonDatagridService {
  private readonly COLUMN_STORAGE_KEY = 'userJobColumn';

  // Set column preferences using ColumnHeaderModel
  setColsLocalStorage(cols?: ColumnHeaderModel[]): void {
    try {
      const columnsToStore = cols || this.getDefaultColumns();
      localStorage.setItem(this.COLUMN_STORAGE_KEY, JSON.stringify(columnsToStore));
      console.log('Column preferences saved successfully');
    } catch (error) {
      console.error('Failed to save column preferences:', error);
    }
  }

  // Get column preferences
  getColsLocalStorage(): ColumnHeaderModel[] {
    try {
      const stored = localStorage.getItem(this.COLUMN_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return this.validateColumnStructure(parsed);
      }
    } catch (error) {
      console.error('Failed to retrieve column preferences:', error);
    }
    
    // Return default columns if retrieval fails
    return this.getDefaultColumns();
  }

  // Get default columns configuration
  private getDefaultColumns(): ColumnHeaderModel[] {
    return [
      {
        prettyName: 'ID',
        technicalName: 'id',
        visible: true,
        selected: true
      },
      {
        prettyName: 'Title',
        technicalName: 'title',
        visible: true,
        selected: true
      },
      {
        prettyName: 'Asset Number',
        technicalName: 'assetNumber',
        visible: true,
        selected: true
      },
      {
        prettyName: 'Serial Number',
        technicalName: 'serialNumber',
        visible: true,
        selected: true
      },
      {
        prettyName: 'Due Date',
        technicalName: 'dueDate',
        visible: true,
        selected: true
      },
      {
        prettyName: 'Status',
        technicalName: 'status',
        visible: true,
        selected: true
      },
      {
        prettyName: 'Site Name',
        technicalName: 'siteName',
        visible: true,
        selected: true
      },
      {
        prettyName: 'Post Code',
        technicalName: 'sitePostCode',
        visible: true,
        selected: true
      },
      {
        prettyName: 'Actions',
        technicalName: 'actions',
        visible: true,
        selected: true
      }
    ];
  }

  // Validate column structure to ensure it has required properties
  private validateColumnStructure(columns: any[]): ColumnHeaderModel[] {
    return columns.map(col => ({
      prettyName: col.prettyName || '',
      technicalName: col.technicalName || '',
      visible: col.visible !== undefined ? col.visible : true,
      selected: col.selected !== undefined ? col.selected : true,
      value: col.value
    }));
  }

  // Reset to default columns
  resetColumnsToDefault(): void {
    this.setColsLocalStorage();
  }

  // Update specific column visibility
  updateColumnVisibility(technicalName: string, visible: boolean): void {
    const columns = this.getColsLocalStorage();
    const columnIndex = columns.findIndex(col => col.technicalName === technicalName);
    
    if (columnIndex !== -1) {
      columns[columnIndex].visible = visible;
      columns[columnIndex].selected = visible; // Keep both properties in sync
      this.setColsLocalStorage(columns);
    }
  }

  // Toggle column visibility
  toggleColumnVisibility(technicalName: string): void {
    const columns = this.getColsLocalStorage();
    const column = columns.find(col => col.technicalName === technicalName);
    
    if (column) {
      const newVisibility = !column.visible;
      this.updateColumnVisibility(technicalName, newVisibility);
    }
  }

  // Get visible columns only
  getVisibleColumns(): ColumnHeaderModel[] {
    return this.getColsLocalStorage().filter(col => col.visible);
  }

  // Update column order (if you want to implement drag & drop)
  reorderColumns(newOrder: string[]): void {
    const columns = this.getColsLocalStorage();
    const reorderedColumns: ColumnHeaderModel[] = [];
    
    // Reorder based on the new order array
    newOrder.forEach(technicalName => {
      const column = columns.find(col => col.technicalName === technicalName);
      if (column) {
        reorderedColumns.push(column);
      }
    });
    
    // Add any missing columns at the end
    columns.forEach(column => {
      if (!newOrder.includes(column.technicalName)) {
        reorderedColumns.push(column);
      }
    });
    
    this.setColsLocalStorage(reorderedColumns);
  }
}