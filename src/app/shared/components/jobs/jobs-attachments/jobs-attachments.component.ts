import { Component, Input, OnInit } from '@angular/core';
import { AddAttachmentsPayload, JobDetail } from 'src/app/core/models/jobs/jobs.model';
import { DownloadService } from 'src/app/core/services/common/download.service';
import { JobsHttpRequestsService } from 'src/app/core/services/http-requests/jobs-http-requests.service';

@Component({
  selector: 'app-jobs-attachments',
  templateUrl: './jobs-attachments.component.html',
  styleUrls: ['./jobs-attachments.component.scss']
})
export class JobsAttachmentsComponent implements OnInit {

  @Input() job!: JobDetail;
  
  jobAttachments: any[] = [];
  isAddingAttachment: boolean = false;
  isUploading: boolean = false;
  
  // Dropzone properties
  files: File[] = [];
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xlsx,.xls,.ppt,.pptx';
  isLoadingAttachments: boolean = false;
  constructor(
    private jobsHttpRequestsService: JobsHttpRequestsService,
    private downloadService: DownloadService
  ) { }

  ngOnInit(): void {
    this.loadAttachments();
  }

  loadAttachments() {
    this.isLoadingAttachments = true;
    
    this.jobsHttpRequestsService.getJobAttachments(this.job.id).subscribe({
      next: (response) => {
        this.jobAttachments = response;
        console.log('Attachments loaded successfully:', response);
        this.isLoadingAttachments = false;
      },
      error: (error) => {
        console.error('Error loading attachments:', error);
        this.isLoadingAttachments = false;
      }
    });
  }

  addAttachmentTrigger() {
    console.log('Adding attachment triggered');
    this.isAddingAttachment = true;
    this.files = []; // Reset files array
  }

  cancelAddAttachment() {
    this.isAddingAttachment = false;
    this.files = [];
  }

  onSelect(event: any) {
    console.log('Files selected:', event.addedFiles);
    this.files.push(...event.addedFiles);
  }

  onRemove(file: File) {
    console.log('File removed:', file);
    this.files = this.files.filter(f => f !== file);
  }

  submitAttachments(): void {
    if (this.files.length === 0) return;

    this.isUploading = true;
    const totalFiles = this.files.length;
    let processedFiles = 0;

    // Process all files and create payload array
    const filePromises = this.files.map((file, index) => {
      return new Promise<AddAttachmentsPayload>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = (reader.result as string).split(',')[1];
          
          // Clean up the file type
          let cleanType = file.type || 'unknown';
          
          // Handle different mime types
          if (cleanType.startsWith('application/')) {
            cleanType = cleanType.replace('application/', '');
            
            // Handle specific application types
            if (cleanType === 'vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
              cleanType = 'xlsx';
            } else if (cleanType === 'vnd.ms-excel') {
              cleanType = 'xls';
            } else if (cleanType === 'vnd.openxmlformats-officedocument.wordprocessingml.document') {
              cleanType = 'docx';
            } else if (cleanType === 'msword') {
              cleanType = 'doc';
            } else if (cleanType === 'vnd.openxmlformats-officedocument.presentationml.presentation') {
              cleanType = 'pptx';
            } else if (cleanType === 'vnd.ms-powerpoint') {
              cleanType = 'ppt';
            } else if (cleanType === 'octet-stream') {
              // Try to get extension from filename
              const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'unknown';
              cleanType = fileExtension;
            }
          } else if (cleanType.startsWith('image/')) {
            cleanType = cleanType.replace('image/', '');
          } else if (cleanType.startsWith('text/')) {
            cleanType = cleanType.replace('text/', '');
          }
          
          const payload: AddAttachmentsPayload = {
            name: file.name,
            type: cleanType,
            file: base64String
          };

          processedFiles++;
          console.log(`Processed ${processedFiles}/${totalFiles} files - Type: ${cleanType}`);
          
          resolve(payload);
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises)
      .then((payloads: AddAttachmentsPayload[]) => {
        console.log('Uploading batch of attachments:', payloads.length);
        
        this.jobsHttpRequestsService.addJobAttachments(this.job.id, payloads).subscribe({
          next: (response) => {
            console.log('Batch upload successful:', response);
            this.loadAttachments();
            this.cancelAddAttachment();
          },
          error: (error) => {
            console.error('Batch upload failed:', error);
          },
          complete: () => {
            this.isUploading = false;
          }
        });
      })
      .catch((error) => {
        console.error('Error processing file batch:', error);
        this.isUploading = false;
      });
  }

  downloadAttachment(attachment: any) {
    console.log('Downloading attachment:', attachment);
  
    if (!attachment.url) {
      console.error('Attachment URL is missing');
      alert('Cannot download: attachment URL is missing');
      return;
    }
    
    this.downloadService.downloadAttachment(attachment).subscribe({
      next: (success) => {
        if (success) {
          console.log('Attachment downloaded successfully');
        }
      },
      error: (error) => {
        console.error('Failed to download attachment:', error);
        alert(`Download failed: ${error.message}`);
      }
    });
  }

  deleteAttachment(attachment: any) {
    // Implement delete logic
    console.log('Deleting attachment:', attachment);
  }

  isAttachmentLoading(attachment: any): boolean {
    const attachmentId = attachment.id || attachment.url || 'unknown';
    // You can subscribe to downloadService.isItemLoading(attachmentId) in template
    return false; // Placeholder
  }
}