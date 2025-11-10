import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ColumnHeaderModel } from 'src/app/core/models/common-datagrid/common-data-grid.model';
import { Contact } from 'src/app/core/models/customer/customer.model';
import { Site } from 'src/app/core/models/site/site.model';
import { CacheService } from 'src/app/core/services/cache/cache.service';
import { DownloadService } from 'src/app/core/services/common/download.service';

@Component({
  selector: 'app-site-data-grid',
  templateUrl: './site-data-grid.component.html',
  styleUrls: ['./site-data-grid.component.scss']
})
export class SiteDataGridComponent implements OnInit {
  @Input() gridFor: string = '';
  @Input() filterString: string = '';
  @Input() showSelectionBox: boolean = false;
  
  @Output() currentPageSize = new EventEmitter<number>();
  @Output() changePageTo = new EventEmitter<any>();
  @Output() searchData = new EventEmitter<any>();
  @Output() updateCount = new EventEmitter<number>();

  // Pagination properties
  @Input() pageSize: number = 10;
  @Input() totalItems: number = 0;
  @Input() currentPage: number = 1;
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
  @Input() withFilter: boolean = true;
  
  @Output() pageChanged = new EventEmitter<{page: number, pageSize: number}>();
  @Output() pageSizeChanged = new EventEmitter<number>();
  @Output() selectionChanged = new EventEmitter<any[]>();
  @Output() unselect = new EventEmitter<any[]>();
  @Output() editSite = new EventEmitter<Site>();


  searchParams: any = {};
  searchFilters: { [key: string]: string } = {};


  private _gridItems: Site[] = [];
  
  @Input() 
    set gridItems(value: Site[]) {
      const previousLength = this._gridItems.length;
      this._gridItems = value || [];
    }
  
  get gridItems(): Site[] {
    return this._gridItems;
  }

  @Input() loading: boolean = false;
  
  @Input() columnHeader: ColumnHeaderModel[] = [];
  
  customPageSize: number | string = 10;
  showCustomPageSize: boolean = false;

  @Output() filterPopupRequested = new EventEmitter<void>();
  @Output() columnArrangementRequested = new EventEmitter<void>();

  selectedItems: any[] = [];
  private selectedItemIds: Set<string | number> = new Set();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cacheService: CacheService,
    private downloadService: DownloadService // Inject DownloadService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchParams = {...params};
      this.applyFilters();
    });
  }

  // Get only visible columns for rendering
  get visibleColumns(): ColumnHeaderModel[] {
    return this.columnHeader.filter(col => col.visible);
  }


  onSearch(event: any, column: string) {
    this.searchFilters[column] = event.target.value;
    this.applyFilters();
  }

  applyFilters() {
    const filters = {...this.searchParams, ...this.searchFilters};
    this.searchData.emit(filters);
  }

  updatePageSize(size: number) {
    this.pageSize = size;
    this.currentPageSize.emit(size);
  }

  onPageSizeChange() {
    if (this.customPageSize === 'custom') {
      this.showCustomPageSize = true;
      return;
    }
    
    this.showCustomPageSize = false;
    const newSize = parseInt(this.customPageSize.toString(), 10);
    this.pageSize = newSize;
    this.currentPage = 1; // Reset to first page
    this.pageSizeChanged.emit(newSize);
    this.pageChanged.emit({ page: 1, pageSize: newSize });
  }

  applyCustomPageSize() {
    const customSize = Number(this.customPageSize);
    if (customSize && customSize > 0) {
      this.pageSize = customSize;
      this.currentPage = 1;
      this.showCustomPageSize = false;
      this.pageSizeChanged.emit(customSize);
      this.pageChanged.emit({ page: 1, pageSize: customSize });
    }
  }

  // Calculate total pages
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  // Calculate start and end item numbers for display
  get startItem(): number {
    return ((this.currentPage - 1) * this.pageSize) + 1; 
  }

  get endItem(): number {
    const end = this.currentPage * this.pageSize;
    return end > this.totalItems ? this.totalItems : end;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      let end = Math.min(this.totalPages, start + maxVisiblePages - 1);
      
      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  /**
   * Get column width based on column type
   */
  getColumnWidth(columnName: string): string {
    const widthMap: { [key: string]: string } = {
      'id': '10px',
      'name': '120px',
      // Add more column mappings as needed
    };

    return widthMap[columnName] || '150px'; // Default width
  }

  /**
   * Get minimum column width
   */
  getColumnMinWidth(columnName: string): string {
    const minWidthMap: { [key: string]: string } = {
      'id': '10px',
      'name': '80px',
      // Add more minimum width mappings as needed
    };

    return minWidthMap[columnName] || '100px'; // Default minimum width
  }

  /**
   * Check if content should show tooltip (optional - for longer content only)
   */
  shouldShowTooltip(content: string, maxLength: number = 20): boolean {
    return !!(content && typeof content === 'string' && content.length > maxLength);
  }
  
  // Clear selection when page changes
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.pageChanged.emit({ page, pageSize: this.pageSize });
    }
  }

  isItemSelected(itemId: string | number): boolean {
      return this.selectedItemIds.has(itemId);
  }

  // Checkbox selection methods
    toggleItemSelection(item: any, event: any): void {
      const isChecked = event.target.checked;
      
      if (isChecked) {
        this.selectedItemIds.add(item.id);
        this.selectedItems.push(item);
        this.onSelectionChange(true);

      } else {
        this.selectedItemIds.delete(item.id);
        this.selectedItems = this.selectedItems.filter(selectedItem => selectedItem.id !== item.id);
        this.onSelectionChange(false, [item]);
      }
      
    }

    // Emit selection changes to parent component
    private onSelectionChange(isSelect: boolean, sites?: any[]): void {
      if (isSelect) {
        this.selectionChanged.emit(this.selectedItems);
      } else {
        this.unselect.emit(sites);
      }
    }

    isAllSelected(): boolean {
      return this.gridItems.length > 0 && this.selectedItems.length === this.gridItems.length;
    }

    isIndeterminate(): boolean {
      return this.selectedItems.length > 0 && this.selectedItems.length < this.gridItems.length;
    }

    // Update your existing methods to use this._gridItems instead of this.gridItems where needed
    toggleSelectAll(event: any): void {
      const isChecked = event.target.checked;
      
      if (isChecked) {
        // Select all items - use the getter which returns this._gridItems
        this.selectedItems = [...this.gridItems];
        this.selectedItemIds = new Set(this.gridItems.map(item => item.id));
        this.onSelectionChange(true);

      } else {
        // Deselect all items
      this.unselect.emit(this.selectedItems);
        this.selectedItems = [];
        this.selectedItemIds.clear();
      }
      
    }

    onEditSite(site: Site): void {
      this.editSite.emit(site);
    }

}
