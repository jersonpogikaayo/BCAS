import { Component, Input, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common/common.service';
import { JobsHttpRequestsService } from 'src/app/core/services/http-requests/jobs-http-requests.service';

@Component({
  selector: 'app-ngbd-sign-off-job-modal',
  templateUrl: './ngbd-sign-off-job-modal.component.html',
  styleUrls: ['./ngbd-sign-off-job-modal.component.scss']
})
export class NgbdSignOffJobModalComponent implements OnInit {
  @Input() jobData: any;
  @Input() isBatch: boolean = false;
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
    this.initializeForm();
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      comments: ['']
    });
  }

  private initializeForm(): void {
    const currentUser = this.getCurrentUser();
    if (currentUser?.name) {
      this.signatureForm.patchValue({
        name: currentUser.name
      });
    }
  }

  private getCurrentUser(): any {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  get f(): { [key: string]: AbstractControl } {
    return this.signatureForm.controls;
  }

  onSignatureCaptured(imageUrl: string): void {
    console.log('📝 Signature captured');
    this.signatureImage = imageUrl;
  }

  clearSignature(): void {
    console.log('🧹 Clearing signature');
    if (this.signaturePad) {
      this.signaturePad.clear();
    }
    this.signatureImage = null;
  }

  isFormValid(): boolean {
    return this.signatureForm.valid && !!this.signatureImage;
  }

 onSubmit(): void {
  this.submitted = true;

  if (!this.signatureForm.valid) {
    console.warn('⚠️ Form is invalid');
    this.markFormGroupTouched();
    return;
  }

  if (!this.signatureImage) {
    console.warn('⚠️ Signature is required');
    return;
  }

  if (!this.jobData?.jobId && !this.jobData?.id && !this.isBatch) {
    console.error('❌ No job ID available for sign-off');
    return;
  }

  console.log('✅ Sign-off form is valid, submitting...');
  this.submitSignOff();
}

  private async submitSignOff(): Promise<void> {
    this.isSubmitting = true;

    try {
      if (!this.signatureImage) {
        throw new Error('Signature image is missing');
      }

      const imageData = this.extractBase64Data(this.signatureImage);
      
      if (!imageData) {
        throw new Error('Invalid signature image format');
      }

      const fileExtension = this.getFileExtensionFromSignature(this.signatureImage);

      const signatureName = this.signatureForm.value.name?.trim();
      if (!signatureName || signatureName.length < 2) {
        throw new Error('Valid signature name is required');
      }

      let jobs: any[] = [];
      if(this.isBatch) {
        jobs = this.jobData.map((job: any) => ({
          JobId: parseInt(job.jobId || job.id || '0', 10),
          Reason: ""
        }));
      }

      const signOffPayload: any = {
        image: imageData,
        fileExtension: fileExtension,
        signatureName: signatureName,
        completeTime: this.commonService.formatDateTime(),
        jobs: this.isBatch ? jobs : [
          {
            JobId: parseInt(this.jobData?.jobId || this.jobData?.id || '0', 10),
            Reason: ""
          }
        ]
      };

      this.validatePayload(signOffPayload);

      const payload = this.isBatch ? signOffPayload : signOffPayload;
      this.jobsHttpRequestsService.signOffBatchPendingJobs(payload).subscribe({
        next: (response) => {
          this.activeModal.close('success');
        },
        error: (error) => {
          console.error('❌ Failed to sign off job:', error);
        }
      });


    } catch (error) {
      console.error('❌ Error during sign-off:', error);
    } finally {
      this.isSubmitting = false;
    }
  }
  
  private extractBase64Data(signatureImage: string): string | null {
    if (!signatureImage) return null;

    if (!signatureImage.includes('base64,')) {
      return signatureImage;
    }

    const parts = signatureImage.split('base64,');
    return parts.length > 1 ? parts[1] : null;
  }

  private validatePayload(payload: any): void {
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
    
    return 'png';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.signatureForm.controls).forEach(key => {
      const control = this.signatureForm.get(key);
      control?.markAsTouched();
    });
  }

  
  close(): void {
    this.activeModal.dismiss({
      success: false,
      action: 'cancel'
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && event.ctrlKey) {
      // Ctrl+Enter to submit
      if (this.isFormValid()) {
        this.onSubmit();
      }
    } else if (event.key === 'Escape') {
      this.close();
    }
  }
}