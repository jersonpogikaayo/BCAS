import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ColumnHeaderModel, GridItem } from 'src/app/core/models/common-datagrid/common-data-grid.model';
import { CacheService } from 'src/app/core/services/cache/cache.service';
import { DownloadService } from 'src/app/core/services/common/download.service';

@Component({
  selector: 'app-equipments-data-grid',
  templateUrl: './equipments-data-grid.component.html',
  styleUrls: ['./equipments-data-grid.component.scss']
})
export class EquipmentsDataGridComponent implements OnInit {

    @Input() gridFor: string = '';
    @Input() filterString: string = '';
    @Input() isEngineer: boolean = true;
    
    @Output() checkedIds = new EventEmitter<string[]>();
    @Output() currentPageSize = new EventEmitter<number>();
    @Output() changePageTo = new EventEmitter<any>();
    @Output() searchData = new EventEmitter<any>();
    @Output() updateCount = new EventEmitter<number>();
    @Output() actionSelected = new EventEmitter<{action: string, item: GridItem}>();
    @Output() selectionChanged = new EventEmitter<any[]>();
    @Output() bulkActionSelected = new EventEmitter<{ action: string, items: any[] }>();
  
    // Pagination properties
    @Input() pageSize: number = 10;
    @Input() totalItems: number = 0;
    @Input() currentPage: number = 1;
    @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
    @Input() withFilter: boolean = true;
    
    @Output() pageChanged = new EventEmitter<{page: number, pageSize: number}>();
    @Output() pageSizeChanged = new EventEmitter<number>();
  
    searchParams: any = {};
    searchFilters: { [key: string]: string } = {};
  
  
    // Replace the existing @Input() gridItems with a setter/getter
    private _gridItems: GridItem[] = [];
    
    @Input() 
    set gridItems(value: GridItem[]) {
      const previousLength = this._gridItems.length;
      this._gridItems = value || [];
      
      // Update selected items when grid items change
      if (previousLength > 0 || this.selectedItems.length > 0) {
        this.updateSelectedItemsAfterGridChange();
      }
    }
    
    get gridItems(): GridItem[] {
      return this._gridItems;
    }
  
    @Input() loading: boolean = false;
    
    @Input() columnHeader: ColumnHeaderModel[] = [
      { prettyName: 'ID', technicalName: 'id', visible: true },
      { prettyName: 'Asset Number', technicalName: 'assetNumber', visible: true },
      { prettyName: 'Serial Number', technicalName: 'serialNumber', visible: true },
    ];
  
    actionLists: any = {};
    batchActionLists: any = {};
    actionLoading: { [key: string]: boolean } = {};
    
    customPageSize: number | string = 10;
    showCustomPageSize: boolean = false;
  
    @Output() filterPopupRequested = new EventEmitter<void>();
    @Output() columnArrangementRequested = new EventEmitter<void>();
  
    // Add subscription for download loading
    private downloadLoadingSubscription?: Subscription;
    private currentDownloadingItem: string | null = null;
    
    // Add selection properties
    selectedItems: any[] = [];
    private selectedItemIds: Set<string | number> = new Set();

    @Input() isShowCheckbox: boolean = true;
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
      this.loadActionLists();
      this.loadBatchActionLists();
      
      // Subscribe to download service loading state
      this.downloadLoadingSubscription = this.downloadService.loading$.subscribe(
        isLoading => {
          if (this.currentDownloadingItem) {
            if (!isLoading) {
              // Download finished, clear the loading state
              this.actionLoading[this.currentDownloadingItem] = false;
              this.currentDownloadingItem = null;
            }
          }
        }
      );
  
      // Subscribe to item-specific loading states
      this.downloadLoadingSubscription = this.downloadService.itemLoading$.subscribe(
        loadingStates => {
          // Update actionLoading based on download service states
          Object.keys(loadingStates).forEach(itemId => {
            this.actionLoading[itemId] = loadingStates[itemId];
          });
          
          // Clear actionLoading for items no longer in loading state
          Object.keys(this.actionLoading).forEach(itemId => {
            if (!loadingStates[itemId]) {
              this.actionLoading[itemId] = false;
            }
          });
        }
      );
    }
  
    ngOnDestroy() {
      // Clean up subscription
      if (this.downloadLoadingSubscription) {
        this.downloadLoadingSubscription.unsubscribe();
      }
    }
  
    // Get only visible columns for rendering
    get visibleColumns(): ColumnHeaderModel[] {
      return this.columnHeader.filter(col => col.visible);
    }
  
    private loadActionLists() {
      const actionListFile = this.isEngineer 
      ? 'assets/jsons/engineer-action-lists.json'
      : 'assets/jsons/manager-action-lists.json';
  
      // Use cache service with 1 hour cache time for static files
      this.cacheService.get(actionListFile, { cacheTime: 60 * 60 * 1000 })
        .subscribe({
          next: (data) => {
            this.actionLists = data;
          },
          error: (error) => {
            console.error('Failed to load action lists:', error);
            // Provide fallback data
            this.actionLists = {};
          }
        });
    }
  
    private loadBatchActionLists() {
      const batchActionListFile = this.isEngineer 
        ? 'assets/jsons/engineer-action-lists-batch.json'
        : 'assets/jsons/manager-action-lists-batch.json';
  
      this.cacheService.get(batchActionListFile, { cacheTime: 60 * 60 * 1000 })
        .subscribe({
          next: (data) => {
            this.batchActionLists = data;
          },
          error: (error) => {
            console.error('Failed to load batch action lists:', error);
            this.batchActionLists = {};
          }
        });
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
  
    // showFilterPopup() {
    //   this.filterPopupRequested.emit();
    // }s
  
    // showColumnArrangementPopup() {
    //   this.columnArrangementRequested.emit();
    // }
  
    getActionsForStatus(): string[] {
      return ['View Detail'];
    }
  
    handleAction(action: string, item: GridItem) {
      if (action === 'edit') {
        this.actionSelected.emit({ action: 'edit', item });
      }
    }
  
    resetActionLoading(itemId: string) {
      this.actionLoading[itemId] = false;
      if (this.currentDownloadingItem === itemId) {
        this.currentDownloadingItem = null;
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
  
    getColumnClass(columnType: string, value: any): string {
      switch(columnType) {
        case 'status':
          return '';
        case 'dueDate':
          if (value && new Date(value) < new Date()) {
            return 'text-danger fw-bold';
          }
          return '';
        case 'contactEmail':
          return 'text-lowercase';
        default:
          return '';
      }
    }
  
    /**
     * Get column width based on column type
     */
    getColumnWidth(columnName: string): string {
      const widthMap: { [key: string]: string } = {
        'id': '80px',
        'jobNumber': '120px',
        'patientName': '200px',
        'doctorName': '180px',
        'jobType': '120px',
        'status': '120px',
        'priority': '100px',
        'createdDate': '130px',
        'updatedDate': '130px',
        'dueDate': '130px',
        'actions': '100px',
        // Add more column mappings as needed
      };
  
      return widthMap[columnName] || '150px'; // Default width
    }
  
    /**
     * Get minimum column width
     */
    getColumnMinWidth(columnName: string): string {
      const minWidthMap: { [key: string]: string } = {
        'id': '60px',
        'actions': '80px',
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
  
    // Checkbox selection methods
    toggleItemSelection(item: any, event: any): void {
      const isChecked = event.target.checked;
      
      if (isChecked) {
        this.selectedItemIds.add(item.id);
        this.selectedItems.push(item);
      } else {
        this.selectedItemIds.delete(item.id);
        this.selectedItems = this.selectedItems.filter(selectedItem => selectedItem.id !== item.id);
      }
      
      this.onSelectionChange();
    }
  
    isItemSelected(itemId: string | number): boolean {
      return this.selectedItemIds.has(itemId);
    }
  
    isAllSelected(): boolean {
      return this.gridItems.length > 0 && this.selectedItems.length === this.gridItems.length;
    }
  
    isIndeterminate(): boolean {
      return this.selectedItems.length > 0 && this.selectedItems.length < this.gridItems.length;
    }
  
    clearSelection(): void {
      this.selectedItems = [];
      this.selectedItemIds.clear();
      this.onSelectionChange();
    }
  
    // Bulk actions
    performBulkAction(action: string): void {
      if (this.selectedItems.length === 0) {
        console.log('No items selected for bulk action');
        return;
      }
      
      
      switch (action) {
        case 'assign':
          this.bulkAssign();
          break;
        case 'cancel':
          this.bulkCancel();
          break;
        case 'download':
          this.bulkDownload();
          break;
        default:
          console.log('Unknown bulk action:', action);
      }
    }
  
    private bulkAssign(): void {
      console.log('Bulk assigning items:', this.selectedItems);
      // Implement bulk assign logic
      this.bulkActionSelected.emit({ action: 'assign', items: this.selectedItems });
    }
  
    private bulkCancel(): void {
      console.log('Bulk canceling items:', this.selectedItems);
      // Implement bulk cancel logic
      this.bulkActionSelected.emit({ action: 'cancel', items: this.selectedItems });
    }
  
    private bulkDownload(): void {
      console.log('Bulk downloading items:', this.selectedItems);
      // Implement bulk download logic
      this.bulkActionSelected.emit({ action: 'download', items: this.selectedItems });
    }
  
    // Emit selection changes to parent component
    private onSelectionChange(): void {
      this.selectionChanged.emit(this.selectedItems);
    }
  
    // Clear selection when page changes
    onPageChange(page: number): void {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.currentPage = page;
        this.clearSelection(); // Clear selection on page change
        this.pageChanged.emit({ page, pageSize: this.pageSize });
      }
    }
  
    // Get batch actions for selected items
    getBatchActionsForStatus(): string[] {
      if (this.selectedItems.length === 0) {
        return [];
      }
  
      // Get all unique status types from selected items
      const statusTypes = [...new Set(this.selectedItems.map(item => item.jobStatusType))];
      
      if (statusTypes.length === 1) {
        // All selected items have the same status
        const statusMap: { [key: number]: string } = {
          0: 'unassigned',
          2: 'assigned', 
          5: 'booked',
          7: 'inProgress',
          8: 'incomplete',
          9: 'failed',
          10: 'pending',
          11: 'completed',
          12: 'paused'
        };
  
        const status = statusMap[statusTypes[0]];
        return status ? this.batchActionLists[status] || [] : [];
      } else {
        // Mixed status types - return common actions
        return this.getCommonBatchActions(statusTypes);
      }
    }
  
    // Get actions that are common to all selected status types
    private getCommonBatchActions(statusTypes: number[]): string[] {
      const statusMap: { [key: number]: string } = {
        0: 'unassigned',
        2: 'assigned',
        5: 'booked', 
        7: 'inProgress',
        8: 'incomplete',
        9: 'failed',
        10: 'pending',
        11: 'completed',
        12: 'paused'
      };
  
      const allActionsArrays = statusTypes.map(statusType => {
        const status = statusMap[statusType];
        return status ? this.batchActionLists[status] || [] : [];
      });
  
      if (allActionsArrays.length === 0) {
        return [];
      }
  
      // Find intersection of all action arrays
      return allActionsArrays.reduce((common, current) => 
        common.filter((action: any) => current.includes(action))
      );
    }
  
    // Handle batch actions
    handleBatchAction(action: string): void {
      if (this.selectedItems.length === 0) {
        console.log('No items selected for batch action');
        return;
      }
  
      console.log(`Performing batch action "${action}" on ${this.selectedItems.length} items:`, this.selectedItems);
      this.bulkActionSelected.emit({ action, items: this.selectedItems });
    }
  
  
    private updateSelectedItemsAfterGridChange(): void {
      if (this.selectedItems.length === 0) {
        return; // No selected items to update
      }
  
      const currentGridItemIds = new Set(this._gridItems.map(item => item.id));
      const previousSelectedCount = this.selectedItems.length;
      
      // Keep only selected items that still exist in the new grid
      this.selectedItems = this.selectedItems.filter(item => {
        return currentGridItemIds.has(item.id);
      });
      
      // Update the selectedItemIds set
      this.selectedItemIds = new Set(this.selectedItems.map(item => item.id));
      
      // Log if any items were removed from selection
      if (this.selectedItems.length !== previousSelectedCount) {
        const removedCount = previousSelectedCount - this.selectedItems.length;
        this.onSelectionChange();
      }
    }
  
    // Update your existing methods to use this._gridItems instead of this.gridItems where needed
    toggleSelectAll(event: any): void {
      const isChecked = event.target.checked;
      
      if (isChecked) {
        // Select all items - use the getter which returns this._gridItems
        this.selectedItems = [...this.gridItems];
        this.selectedItemIds = new Set(this.gridItems.map(item => item.id));
      } else {
        // Deselect all items
        this.selectedItems = [];
        this.selectedItemIds.clear();
      }
      
      this.onSelectionChange();
    }

}
