import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface DownloadOptions {
  filename?: string;
  showProgress?: boolean;
  customHeaders?: { [key: string]: string };
}

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  private apiUrl = environment.api;
  
  // Global loading state
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  
  // Per-item loading states
  private itemLoadingSubject = new BehaviorSubject<{[key: string]: boolean}>({});
  public itemLoading$ = this.itemLoadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Download attachment file using attachment URL
   */
  downloadAttachment(attachment: any, options?: DownloadOptions): Observable<boolean> {
    console.log('📎 Downloading attachment:', attachment.name || attachment.url);
    
    const attachmentId = attachment.id || attachment.url || 'unknown';
    
    // Set both global and item-specific loading
    this.loadingSubject.next(true);
    this.setItemLoading(attachmentId, true);
    
    const result = new BehaviorSubject<boolean>(false);
    
    this.downloadAttachmentData(attachment).pipe(
      finalize(() => {
        this.loadingSubject.next(false);
        this.setItemLoading(attachmentId, false);
      })
    ).subscribe({
      next: (data: Blob) => {
        this.downloadAttachmentFile(data, attachment, options);
        result.next(true);
        result.complete();
      },
      error: (error: any) => {
        console.error('❌ Error downloading attachment:', error);
        this.handleDownloadError(error, 'Attachment');
        result.error(error);
      }
    });
    
    return result.asObservable();
  }

  private downloadAttachmentFile(
    data: Blob, 
    attachment: any, 
    options?: DownloadOptions
  ): void {
    try {
      // Get file info from attachment
      const originalName = attachment.name || attachment.fileName || 'attachment';
      const fileExtension = this.getFileExtension(originalName, attachment.type || attachment.mimeType);
      const mimeType = this.getMimeType(attachment.type || attachment.mimeType || fileExtension);

      // Generate filename
      const filename = options?.filename || this.generateAttachmentFilename(attachment);
      
      // Create blob with correct MIME type
      const blob = new Blob([data], { type: mimeType });
      
      // Check if the blob has content
      if (blob.size === 0) {
        throw new Error('Downloaded attachment is empty');
      }

      console.log(`📁 Attachment size: ${this.getFileSizeString(blob.size)}`);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);
      
      console.log(`✅ Attachment downloaded successfully:`, filename);
      
      // Show success notification
      this.showSuccessNotification('Attachment', filename);
      
    } catch (error) {
      console.error('❌ Error saving attachment:', error);
      this.handleDownloadError(error, 'Attachment');
    }
  }

  /**
   * Download attachment data from URL
   */
  private downloadAttachmentData(attachment: any): Observable<Blob> {
    const url = "https://api.bcas.mfit.uk/" + attachment.url;
    
    if (!url) {
      throw new Error('Attachment URL is missing');
    }
    
    console.log('📎 Attachment URL:', url);
    
    const headers = new HttpHeaders({
      'Accept': '*/*',
      'Content-Type': 'application/json'
    });

    return this.http.get(url, {
      headers,
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<Blob>) => {
        if (response.body) {
          return response.body;
        }
        throw new Error('No data received');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Download Excel file for a job
   */
  downloadExcel(job: any, options?: DownloadOptions): Observable<boolean> {
    const jobId = job.id || job.jobId;
    
    // Set both global and item-specific loading
    this.loadingSubject.next(true);
    this.setItemLoading(jobId, true);
    
    const result = new BehaviorSubject<boolean>(false);
    
    this.downloadExcelData(job).pipe(
      finalize(() => {
        this.loadingSubject.next(false);
        this.setItemLoading(jobId, false);
      })
    ).subscribe({
      next: (data: Blob) => {
        this.downloadFileData(data, job, 'excel', options);
        result.next(true);
        result.complete();
      },
      error: (error: any) => {
        console.error('❌ Error downloading Excel file:', error);
        this.handleDownloadError(error, 'Excel');
        result.error(error);
      }
    });
    
    return result.asObservable();
  }

  /**
   * Download PDF file for a job
   */
  downloadPDF(job: any, options?: DownloadOptions): Observable<boolean> {
    console.log('📄 Downloading PDF for job:', job.id);
    this.loadingSubject.next(true);
    
    const result = new BehaviorSubject<boolean>(false);
    
    this.downloadPDFData(job).pipe(
      finalize(() => this.loadingSubject.next(false))
    ).subscribe({
      next: (data: Blob) => {
        this.downloadFileData(data, job, 'pdf', options);
        result.next(true);
        result.complete();
      },
      error: (error: any) => {
        console.error('❌ Error downloading PDF file:', error);
        this.handleDownloadError(error, 'PDF');
        result.error(error);
        result.complete();
      }
    });
    
    return result.asObservable();
  }

  /**
   * Download Excel data from API
   */
  private downloadExcelData(job: any): Observable<Blob> {
    const jobId = job.id || job.jobId;
    const url = `${this.apiUrl}Excel/job/${jobId}`;
    
    console.log('📊 Excel URL:', url);
    
    const headers = new HttpHeaders({
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Type': 'application/json'
    });

    return this.http.get(url, {
      headers,
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<Blob>) => {
        if (response.body) {
          return response.body;
        }
        throw new Error('No data received');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Download PDF data from API
   */
  private downloadPDFData(job: any): Observable<Blob> {
    const jobId = job.id || job.jobId;
    const url = `${this.apiUrl}excel/job/pdf/${jobId}`;
    
    console.log('📄 PDF URL:', url);
    
    const headers = new HttpHeaders({
      'Accept': 'application/pdf',
      'Content-Type': 'application/json'
    });

    return this.http.get(url, {
      headers,
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<Blob>) => {
        if (response.body) {
          return response.body;
        }
        throw new Error('No data received');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Handle file download and save to user's device
   */
  private downloadFileData(
    data: Blob, 
    job: any, 
    fileType: 'excel' | 'pdf', 
    options?: DownloadOptions
  ): void {
    try {
      // Determine file extension and MIME type
      const extension = fileType === 'excel' ? 'xlsx' : 'pdf';
      const mimeType = fileType === 'excel' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';

      // Generate filename
      const filename = options?.filename || this.generateFilename(job, fileType);
      
      // Create blob with correct MIME type
      const blob = new Blob([data], { type: mimeType });
      
      // Check if the blob has content
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      console.log(`📁 File size: ${this.getFileSizeString(blob.size)}`);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${extension}`;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);
      
      console.log(`✅ ${fileType.toUpperCase()} file downloaded successfully:`, filename);
      
      // Show success notification (optional)
      this.showSuccessNotification(fileType, filename);
      
    } catch (error) {
      console.error('❌ Error saving file:', error);
      this.handleDownloadError(error, fileType);
    }
  }

  /**
   * Generate filename based on job data and file type
   */
  private generateFilename(job: any, fileType: 'excel' | 'pdf'): string {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const jobId = job.id || job.jobId || 'unknown';
    const jobRef = job.reference || job.jobReference || job.ref || '';
    
    if (jobRef) {
      return `job_${jobRef}_${date}`;
    }
    
    return `job_${jobId}_${date}`;
  }

  /**
   * Handle download errors
   */
  private handleError = (error: any): Observable<never> => {
    console.error('Download service error:', error);
    
    let errorMessage = 'An error occurred while downloading the file';
    
    if (error.status === 404) {
      errorMessage = 'File not found on server';
    } else if (error.status === 403) {
      errorMessage = 'Access denied. You do not have permission to download this file';
    } else if (error.status === 500) {
      errorMessage = 'Server error. Please try again later';
    } else if (error.status === 0) {
      errorMessage = 'Network error. Please check your connection';
    } else if (error.error instanceof Blob) {
      // Try to read error message from blob
      error.error.text().then((text: string) => {
        console.error('Server error message:', text);
      });
    }
    
    return throwError(() => new Error(errorMessage));
  };

  /**
   * Handle download errors with user feedback
   */
  private handleDownloadError(error: any, fileType: string): void {
    const message = error.message || `Error downloading ${fileType} file`;
    console.error(`❌ ${fileType} download failed:`, message);
    
    // You can integrate with your notification service here
    // this.notificationService.showError(message);
    
    // For now, show browser alert (replace with your notification system)
    alert(`Download failed: ${message}`);
  }

  /**
   * Show success notification
   */
  private showSuccessNotification(fileType: string, filename: string): void {
    const message = `${fileType.toUpperCase()} file "${filename}" downloaded successfully`;
    console.log(`✅ ${message}`);
    
    // You can integrate with your notification service here
    // this.notificationService.showSuccess(message);
  }

  /**
   * Check if file download is supported
   */
  isDownloadSupported(): boolean {
    return !!(window.URL && typeof window.URL.createObjectURL === 'function' && typeof document.createElement === 'function');
  }

  /**
   * Get file size in human readable format
   */
  getFileSizeString(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  private setItemLoading(itemId: string, loading: boolean): void {
    const currentState = this.itemLoadingSubject.value;
    const newState = { ...currentState };
    
    if (loading) {
      newState[itemId] = true;
    } else {
      delete newState[itemId];
    }
    
    this.itemLoadingSubject.next(newState);
  }

  // Check if specific item is loading
  isItemLoading(itemId: string): Observable<boolean> {
    return this.itemLoading$.pipe(
      map(loadingStates => !!loadingStates[itemId])
    );
  }

  private generateAttachmentFilename(attachment: any): string {
  const originalName = attachment.name || attachment.fileName || 'attachment';
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // If original name already has extension, return as is
  if (originalName.includes('.')) {
    return originalName;
  }
  
  // Try to get extension from type or URL
  const extension = this.getFileExtension(originalName, attachment.type || attachment.mimeType);
  
  return `${originalName}${extension ? '.' + extension : ''}`;
}

/**
 * Get file extension from filename or mime type
 */
private getFileExtension(filename: string, mimeType?: string): string {
  // First try to get extension from filename
  const filenameParts = filename.split('.');
  if (filenameParts.length > 1) {
    return filenameParts.pop()?.toLowerCase() || '';
  }
  
  // If no extension in filename, try to get from mime type
  if (mimeType) {
    const mimeToExt: {[key: string]: string} = {
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.ms-powerpoint': 'ppt',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'text/plain': 'txt',
      'text/csv': 'csv'
    };
    
    return mimeToExt[mimeType.toLowerCase()] || '';
  }
  
  return '';
}

/**
 * Get MIME type from file type or extension
 */
private getMimeType(type?: string): string {
  if (!type) return 'application/octet-stream';
  
  // If it's already a full MIME type, return as is
  if (type.includes('/')) {
    return type;
  }
  
  // Convert simple type to MIME type
  const typeToMime: {[key: string]: string} = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'txt': 'text/plain',
    'csv': 'text/csv'
  };
  
  return typeToMime[type.toLowerCase()] || 'application/octet-stream';
}
}