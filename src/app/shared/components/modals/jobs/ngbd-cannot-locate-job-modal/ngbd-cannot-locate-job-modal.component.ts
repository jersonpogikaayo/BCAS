import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common/common.service';
import { JobsHttpRequestsService } from 'src/app/core/services/http-requests/jobs-http-requests.service';

@Component({
  selector: 'app-ngbd-cannot-locate-job-modal',
  templateUrl: './ngbd-cannot-locate-job-modal.component.html',
  styleUrls: ['./ngbd-cannot-locate-job-modal.component.scss']
})
export class NgbdCannotLocateJobModalComponent implements OnInit {
  @Input() jobData: any; // Job data passed from parent
  @ViewChild('signaturePad') signaturePad: any;

  signatureForm: FormGroup;
  submitted: boolean = false;
  isSubmitting: boolean = false;
  signatureImage: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal,
    private jobsHttpRequestsService: JobsHttpRequestsService,
    private commonService: CommonService
  ) {
    this.signatureForm = this.createForm();
  }

  ngOnInit(): void {
    console.log('🚀 Job Data:', this.jobData);
    this.initializeForm();
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      reason: [''] // Optional field
    });
  }

  private initializeForm(): void {
    // Pre-populate with current user name if available
    const currentUser = this.getCurrentUser();
    if (currentUser?.name) {
      this.signatureForm.patchValue({
        name: currentUser.name
      });
    }
  }

  private getCurrentUser(): any {
    // Get current user from localStorage or service
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  // Convenience getter for easy access to form controls
  get f(): { [key: string]: AbstractControl } {
    return this.signatureForm.controls;
  }

  /**
   * Handle signature capture
   */
  onSignatureCaptured(imageUrl: string): void {
    console.log('📝 Signature captured');
    this.signatureImage = imageUrl;
  }

  /**
   * Clear signature
   */
  clearSignature(): void {
    console.log('🧹 Clearing signature');
    if (this.signaturePad) {
      this.signaturePad.clear();
    }
    this.signatureImage = null;
  }

  /**
   * Check if form is valid
   */
  isFormValid(): boolean {
    return this.signatureForm.valid && !!this.signatureImage;
  }

  /**
   * Submit the sign-off
   */

 onSubmit(): void {
  this.submitted = true;

  // Validate form and signature
  if (!this.signatureForm.valid) {
    console.warn('⚠️ Form is invalid');
    this.markFormGroupTouched();
    return;
  }

  if (!this.signatureImage) {
    console.warn('⚠️ Signature is required');
    return;
  }

  // Validate job data
  if (this.jobData.length == 0) {
    console.error('❌ No job ID available for sign-off');
    // this.showErrorMessage('Unable to sign off: Job ID is missing.');
    return;
  }

  console.log('✅ Sign-off form is valid, submitting...');
  this.submitSignOff();
}

  private async submitSignOff(): Promise<void> {
    this.isSubmitting = true;

    try {
      // Validate signature image
      if (!this.signatureImage) {
        throw new Error('Signature image is missing');
      }

      // Extract the base64 image data
      const imageData = this.extractBase64Data(this.signatureImage);
      
      if (!imageData) {
        throw new Error('Invalid signature image format');
      }

      // Get file extension
      const fileExtension = this.getFileExtensionFromSignature(this.signatureImage);

      // Validate name
      const signatureName = this.signatureForm.value.name?.trim();
      if (!signatureName || signatureName.length < 2) {
        throw new Error('Valid signature name is required');
      }

      const jobs = this.createJobsArray();

      // Build the API payload
      const signOffPayload: any = {
        image: imageData,
        fileExtension: fileExtension,
        signatureName: signatureName,
        completeTime: this.commonService.formatDateTime(),
        jobs: jobs
      };

      // Validate payload before sending
      this.validatePayload(signOffPayload);

      console.log('📤 Submitting sign-off payload:', {
        ...signOffPayload,
      });

      this.jobsHttpRequestsService.cannotLocateJob(signOffPayload).subscribe({
        next: (response) => {
          console.log('✅ Job signed off successfully:', response);
          this.activeModal.close('success');
        },
        error: (error) => {
          console.error('❌ Failed to sign off job:', error);
          // Handle error
        }
      });

      // Return the formatted payload to parent

    } catch (error) {
      console.error('❌ Error during sign-off:', error);
      // this.showErrorMessage(error instanceof Error ? error.message : 'Failed to sign off job. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Extract base64 data from signature image
   */
  private extractBase64Data(signatureImage: string): string | null {
    if (!signatureImage) return null;

    // If it's already base64 without prefix, return as is
    if (!signatureImage.includes('base64,')) {
      return signatureImage;
    }

    // Extract base64 data after the comma
    const parts = signatureImage.split('base64,');
    return parts.length > 1 ? parts[1] : null;
  }

  /**
   * Validate the payload before submission
   */
  private validatePayload(payload: any): void {
    console.log('📋 Validating sign-off payload:', payload);
    if (!payload.image || payload.image.length === 0) {
      throw new Error('Signature image is required');
    }

    if (!payload.signatureName || payload.signatureName.length < 2) {
      throw new Error('Signature name must be at least 2 characters');
    }

    if (!payload.jobs || payload.jobs.length === 0 || !payload.jobs[0].JobId) {
      throw new Error('Valid job ID is required');
    }

    if (!payload.completeTime) {
      throw new Error('Complete time is required');
    }
  }

  /**
   * Extract file extension from signature image data
   */
  private getFileExtensionFromSignature(signatureImage: string | null): string {
    if (!signatureImage) return 'png';
    
    const formatMap: { [key: string]: string } = {
      'data:image/png': 'png',
      'data:image/jpeg': 'jpg',
      'data:image/jpg': 'jpg',
      'data:image/gif': 'gif',
      'data:image/webp': 'webp',
      'data:image/svg': 'svg'
    };

    for (const [format, extension] of Object.entries(formatMap)) {
      if (signatureImage.includes(format)) {
        return extension;
      }
    }
    
    return 'png'; // Default fallback
  }

  /**
   * Mark all form controls as touched to show validation errors
   */
  private markFormGroupTouched(): void {
    Object.keys(this.signatureForm.controls).forEach(key => {
      const control = this.signatureForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Close modal without action
   */
  close(): void {
    this.activeModal.dismiss({
      success: false,
      action: 'cancel'
    });
  }

  /**
   * Handle keyboard shortcuts
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && event.ctrlKey) {
      // Ctrl+Enter to submit
      if (this.isFormValid()) {
        this.onSubmit();
      }
    } else if (event.key === 'Escape') {
      // Escape to close
      this.close();
    }
  }

  private createJobsArray(): any[] {
    if (!this.jobData) {
      return [];
    }

    // Handle single job (object)
    if (!Array.isArray(this.jobData)) {
      return [{
        jobStatusId: 0,
        JobId: parseInt(this.jobData.id || this.jobData.jobId || '0', 10),
        Reason: this.signatureForm.value.reason || ""
      }];
    }

    // Handle multiple jobs (array)
    return this.jobData.map(job => ({
      jobStatusId: 0,
      JobId: parseInt(job.id || job.jobId || '0', 10),
      Reason: this.signatureForm.value.reason || ""
    }));
  }

}
