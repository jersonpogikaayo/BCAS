import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobDetail } from 'src/app/core/models/jobs/jobs.model';
import { JobsHttpRequestsService } from 'src/app/core/services/http-requests/jobs-http-requests.service';

@Component({
  selector: 'app-jobs-details',
  templateUrl: './jobs-details.component.html',
  styleUrls: ['./jobs-details.component.scss']
})
export class JobsDetailsComponent implements OnInit {

  @Input() isCreate: boolean = false;
  @Input() job!: JobDetail;
  @Input() selectedEquipment: any[] = [];
  @Output() jobDetails = new EventEmitter<JobDetail>();
  
  jobNotes: any[] = [];
  jobDetailsForm!: FormGroup;
  submittedDetails: boolean = false;
  isDueDateManual: boolean = false;
  jobFrequency: any[] = [
    { name: 'Daily', days: 1 },
    { name: 'Weekly', days: 7 },
    { name: 'Monthly', days: 30 },
    { name: 'Quarterly', days: 90 },
    { name: 'Semi-Annual', days: 180 },
    { name: 'Annual', days: 365 }
  ];
  
  constructor(
    private formBuilder: FormBuilder,
    private jobsHttpRequestsService: JobsHttpRequestsService,
  ) { }

  ngOnInit(): void {
    console.log(this.selectedEquipment)
    console.log(this.isCreate)
    if(this.isCreate) {
      this.initForm();
    } else {
      this.loadNotes();
    }
  }

  initForm(): void {
    let title = '';
    if(this.selectedEquipment.length !== 0) {
      title = this.selectedEquipment.map(equipment => equipment.serialNumber).join('-');
    }

    this.jobDetailsForm = this.formBuilder.group({
      Title: [title, [Validators.required]],
      SpecialRequirements: [''],
      DueDate: ['', [Validators.required]],
      Recurring: [true],
      jobLifespan: [365],
      NextDueDate: ['']
    });

    // Emit form changes to parent component
    this.jobDetailsForm.valueChanges.subscribe(value => {
      this.jobDetails.emit(value);
    });
  }

  // Method to check if form is valid - accessible from parent
  isJobDetailsValid(): boolean {
    if (!this.jobDetailsForm) {
      return false;
    }
    
    // Check required fields
    const formValue = this.jobDetailsForm.value;
    const hasTitle = formValue.Title && formValue.Title.trim() !== '';
    const hasDueDate = formValue.DueDate && formValue.DueDate !== '';
    
    // Additional validation for recurring jobs
    if (formValue.Recurring) {
      const hasValidRecurring = !this.isDueDateManual 
        ? formValue.jobLifespan !== null 
        : formValue.NextDueDate && formValue.NextDueDate !== '';
      
      return hasTitle && hasDueDate && hasValidRecurring;
    }
    
    return hasTitle && hasDueDate;
  }

  // Alternative method that checks Angular form validity
  isFormValid(): boolean {
    return this.jobDetailsForm ? this.jobDetailsForm.valid : false;
  }

  // Method to get current form values - accessible from parent
  getJobDetailsData(): any {
    return this.jobDetailsForm ? this.jobDetailsForm.value : null;
  }

  // Method to validate and mark form as touched - accessible from parent
  validateForm(): boolean {
    if (!this.jobDetailsForm) {
      return false;
    }

    this.submittedDetails = true;
    this.markFormGroupTouched();
    return this.jobDetailsForm.valid;
  }

  // Getter for easy access to form controls
  get jobDetailsFormControl() {
    return this.jobDetailsForm.controls;
  }

  loadNotes(): void {
    if (this.job?.id) {
      this.jobsHttpRequestsService.getJobNotes(this.job.id).subscribe({
        next: (response) => {
          this.jobNotes = response;
          console.log('Notes loaded successfully:', response);
        },
        error: (error) => {
          console.error('Error loading notes:', error);
        }
      });
    }
  }

  jobRecurring(event: any): void {
    const isRecurring = event.target.checked;
    console.log('Job recurring changed:', isRecurring);
    
    if (!isRecurring) {
      // If not recurring, clear the lifespan and next due date
      this.jobDetailsForm.patchValue({
        jobLifespan: null,
        NextDueDate: null
      });
      this.isDueDateManual = false;
    } else {
      // If recurring, set default lifespan
      this.jobDetailsForm.patchValue({
        jobLifespan: 365
      });
    }
  }

  setLifespanToNull(): void {
    this.jobDetailsForm.patchValue({
      jobLifespan: null
    });
  }

  setNextDueDateToNull(): void {
    this.jobDetailsForm.patchValue({
      NextDueDate: null
    });
  }

  onSubmit(): void {
    this.submittedDetails = true;
    
    if (this.jobDetailsForm.valid) {
      const formData = this.jobDetailsForm.value;
      console.log('Job details form data:', formData);
      
      // Process the form data here
      if (this.isCreate) {
        this.createJob(formData);
      } else {
        this.updateJob(formData);
      }
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched();
    }
  }

  private createJob(jobData: any): void {
    // Implement job creation logic
    console.log('Creating job with data:', jobData);
   }

  private updateJob(jobData: any): void {
    // Implement job update logic
    console.log('Updating job with data:', jobData);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.jobDetailsForm.controls).forEach(key => {
      const control = this.jobDetailsForm.get(key);
      control?.markAsTouched();
    });
  }

  // Validation helper methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.jobDetailsForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submittedDetails));
  }

  getFieldError(fieldName: string): string {
    const field = this.jobDetailsForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
    }
    return '';
  }
}
