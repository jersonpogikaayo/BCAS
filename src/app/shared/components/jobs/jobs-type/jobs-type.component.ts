// jobs-type.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { JobType } from 'src/app/core/models/jobs/jobs.model';

@Component({
  selector: 'app-jobs-type',
  templateUrl: './jobs-type.component.html',
  styleUrls: ['./jobs-type.component.scss']
})
export class JobsTypeComponent implements OnInit {
  @Input() allowSelection: boolean = true;
  @Input() showStatus: boolean = true;
  @Input() preSelectedJobType: JobType | null = null; // Changed to single object
  @Input() allowMultipleSelection: boolean = false; // New property for future flexibility
  
  @Output() selectionChanged = new EventEmitter<JobType | null>(); // Changed to single object
  @Output() jobTypeSelected = new EventEmitter<JobType>();

  @Input() jobTypes: JobType[] = [];
  loading: boolean = false;
  error: string = '';

  constructor() { }

  ngOnInit(): void {
    // Set pre-selected job type if provided
    if (this.preSelectedJobType) {
      this.selectJobType(this.preSelectedJobType.id);
    }
  }

  // Single Selection Methods
  toggleJobTypeSelection(jobType: JobType): void {
    if (jobType.isArchived) return;
    
    if (jobType.isSelected) {
      // Deselect if already selected
      this.clearSelection();
    } else {
      // Select this job type (and deselect others)
      this.selectSingleJobType(jobType);
    }
  }

  selectSingleJobType(selectedJobType: JobType): void {
    // Clear all selections first
    this.jobTypes.forEach(jt => jt.isSelected = false);
    
    // Select the chosen job type
    selectedJobType.isSelected = true;
    
    this.emitSelectionChange();
    this.jobTypeSelected.emit(selectedJobType);
  }

  selectJobType(jobTypeId: number): void {
    const jobType = this.jobTypes.find(jt => jt.id === jobTypeId);
    if (jobType && !jobType.isArchived) {
      this.selectSingleJobType(jobType);
    }
  }

  clearSelection(): void {
    this.jobTypes.forEach(jt => jt.isSelected = false);
    this.emitSelectionChange();
  }

  // Getter Methods
  get selectedJobType(): JobType | null {
    return this.jobTypes.find(jt => jt.isSelected) || null;
  }

  getSelectedJobTypeCount(): number {
    return this.selectedJobType ? 1 : 0;
  }

  isJobTypeSelected(jobType: JobType): boolean {
    return jobType.isSelected === true;
  }

  // Utility Methods
  trackByJobTypeId(index: number, jobType: JobType): number {
    return jobType.id;
  }

  getJobTypeRowClass(jobType: JobType): string {
    let classes = '';
    if (jobType.isSelected) classes += 'table-active ';
    if (jobType.isArchived) classes += 'text-muted ';
    return classes.trim();
  }

  getJobTypeStatus(jobType: JobType): string {
    return jobType.isArchived ? 'Archived' : 'Active';
  }

  getJobTypeStatusClass(jobType: JobType): string {
    return jobType.isArchived ? 'badge bg-secondary' : 'badge bg-success';
  }

  private emitSelectionChange(): void {
    this.selectionChanged.emit(this.selectedJobType);
  }
}