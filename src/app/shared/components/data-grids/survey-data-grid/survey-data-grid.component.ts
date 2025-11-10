import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GridItem, ColumnHeaderModel } from 'src/app/core/models/common-datagrid/common-data-grid.model';

@Component({
  selector: 'app-survey-data-grid',
  templateUrl: './survey-data-grid.component.html',
  styleUrls: ['./survey-data-grid.component.scss']
})
export class SurveyDataGridComponent implements OnInit {
  @Input() gridFor: string = '';
  @Input() filterString: string = '';
  @Input() isEngineer: boolean = true;
  
  @Output() currentPageSize = new EventEmitter<number>();
  @Output() changePageTo = new EventEmitter<any>();
  @Output() searchData = new EventEmitter<any>();
  @Output() updateCount = new EventEmitter<number>();
  @Output() actionSelected = new EventEmitter<{action: string, item?: GridItem}>();

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


  private _gridItems: GridItem[] = [];
  
  @Input() 
    set gridItems(value: GridItem[]) {
      const previousLength = this._gridItems.length;
      this._gridItems = value || [];
    }
  
  get gridItems(): GridItem[] {
    return this._gridItems;
  }

  @Input() loading: boolean = false;
  @Input() columnHeader: ColumnHeaderModel[] = [];
  
  customPageSize: number | string = 10;
  showCustomPageSize: boolean = false;

  actionLoading: { [key: string]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
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
      'actions': '10px',
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
      'actions': '10px',
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

  handleAction(action: string, item: GridItem) {
    this.actionSelected.emit({ action: action, item });
  }

  addSurvey() {
    this.actionSelected.emit({ action: 'add' });
  }

  getActionsForStatus(): string[] {
    return ['View Details', 'Edit', 'Delete'];
  }

}
