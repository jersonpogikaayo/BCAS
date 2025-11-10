import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnHeaderModel } from 'src/app/core/models/common-datagrid/common-data-grid.model';

@Component({
  selector: 'ngbd-grid-filter',
  templateUrl: './grid-filter.modal.component.html',
  styleUrls: ['./grid-filter.modal.component.scss'],
})
export class NgbdGridFilterModal implements OnInit {
  
  @Input() selectedColumn: ColumnHeaderModel[] = [];

  // Available columns list using ColumnHeaderModel
  availableColumns: ColumnHeaderModel[] = [
    { prettyName: 'Id', technicalName: 'id', visible: false },
    { prettyName: 'Title', technicalName: 'title', visible: false },
    { prettyName: 'Asset Number', technicalName: 'assetNumber', visible: false },
    { prettyName: 'Serial Number', technicalName: 'serialNumber', visible: false },
    { prettyName: 'Due Date', technicalName: 'dueDate', visible: false },
    { prettyName: 'Site Name', technicalName: 'siteName', visible: false },
    { prettyName: 'Post Code', technicalName: 'sitePostCode', visible: false },
    { prettyName: 'Booked Date', technicalName: 'bookedDate', visible: false },
    { prettyName: 'Completion Date', technicalName: 'completionDate', visible: false },
    { prettyName: 'Next Due Date', technicalName: 'nextDueDate', visible: false },
    { prettyName: 'Job Reference', technicalName: 'jobReference', visible: false },
    { prettyName: 'Status', technicalName: 'status', visible: false },
    { prettyName: 'Job Type', technicalName: 'jobType', visible: false },
    { prettyName: 'Contact Name', technicalName: 'contactFirstName', visible: false },
    { prettyName: 'Contact Surname', technicalName: 'contactSurname', visible: false },
    { prettyName: 'Contact Phone', technicalName: 'contactPhone', visible: false },
    { prettyName: 'Contact Email', technicalName: 'contactEmail', visible: false },
    { prettyName: 'Contact Mobile', technicalName: 'contactMobile', visible: false },
    { prettyName: 'Customer Name', technicalName: 'customer', visible: false },
    { prettyName: 'Equipment Model', technicalName: 'equipmentModel', visible: false },
    { prettyName: 'Equipment Type', technicalName: 'equipmentType', visible: false },
    { prettyName: 'Manufacturer', technicalName: 'manufacturerName', visible: false },
    { prettyName: 'Site Address 1', technicalName: 'siteAddress1', visible: false },
    { prettyName: 'Site Address 2', technicalName: 'siteAddress2', visible: false },
    { prettyName: 'Assigned Username', technicalName: 'userName', visible: false },
  ];

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    this.initializeColumnSelection();
  }

  private initializeColumnSelection(): void {
    const selectedTechnicalNames = new Set(
      this.selectedColumn.map(col => col.technicalName)
    );

    this.availableColumns = this.availableColumns.map(col => ({
      ...col,
      visible: selectedTechnicalNames.has(col.technicalName)
    }));
  }

  toggleSelection(technicalName: string): void {
    const column = this.availableColumns.find(col => col.technicalName === technicalName);
    if (column) {
      column.visible = !column.visible;
    }
  }

  toggleSelectAll(selectAll: any): void {
    const isChecked = selectAll.target ? selectAll.target.checked : selectAll;
    this.availableColumns.forEach(col => col.visible = isChecked);
  }

  get allSelected(): boolean {
    return this.availableColumns.every(col => col.visible);
  }

  get selectedCount(): number {
    return this.availableColumns.filter(col => col.visible).length;
  }

  close(): void {
    this.activeModal.close();
  }

  save(): void {
    const selectedColumns = this.availableColumns
      .filter(col => col.visible)
      .map(col => ({ ...col }));
    
    // Always include Actions column
    const hasActionsColumn = selectedColumns.some(col => col.technicalName === 'actions');
    if (!hasActionsColumn) {
      selectedColumns.push({ 
        prettyName: 'Actions', 
        technicalName: 'actions', 
        visible: true
      });
    }

    this.activeModal.close(selectedColumns);
  }

}