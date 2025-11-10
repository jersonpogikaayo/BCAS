import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-camera-modal',
  template: `
    <div class="modal-header bg-dark text-white">
      <h5 class="modal-title">
        <i class="ri-camera-line me-2"></i>
        Take Photo
      </h5>
      <button type="button" 
              class="btn-close btn-close-white" 
              (click)="closeModal()"></button>
    </div>
    
    <div class="modal-body p-0">
      <div class="camera-container position-relative">
        <video 
          #cameraPreview
          class="w-100"
          autoplay
          playsinline
          muted
          style="max-height: 400px; object-fit: cover;">
        </video>
        
        <div #cameraError 
             class="camera-error text-center p-4 d-none">
          <i class="ri-camera-off-line fs-1 text-muted"></i>
          <p class="text-muted mt-2">Camera not available</p>
          <small class="text-muted">Please check camera permissions or use file upload instead.</small>
        </div>
        
        <canvas #cameraCanvas class="d-none"></canvas>
      </div>
    </div>
    
    <div class="modal-footer bg-light">
      <div class="d-flex justify-content-between w-100">
        <button type="button" 
                class="btn btn-secondary"
                (click)="closeModal()">
          <i class="ri-close-line me-1"></i>
          Cancel
        </button>
        
        <button type="button" 
                class="btn btn-success btn-lg"
                (click)="capturePhoto()">
          <i class="ri-camera-line me-2"></i>
          Capture Photo
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./camera-modal.component.scss']
})
export class CameraModalComponent implements OnInit, OnDestroy {
  @Input() questionId!: number;
  @Output() photoCaptured = new EventEmitter<{questionId: number, imageData: any}>();
  
  private cameraStream?: MediaStream;

  constructor(public activeModal: NgbActiveModal) {}

  async ngOnInit() {
    await this.initializeCamera();
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  private async initializeCamera(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      this.cameraStream = stream;
      const videoElement = document.querySelector('video') as HTMLVideoElement;
      
      if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.play();
      }

    } catch (error) {
      console.error('Error accessing camera:', error);
      this.showCameraError();
    }
  }

  private showCameraError(): void {
    const errorElement = document.querySelector('.camera-error');
    const videoElement = document.querySelector('video');
    
    if (errorElement && videoElement) {
      errorElement.classList.remove('d-none');
      videoElement.style.display = 'none';
    }
  }

  capturePhoto(): void {
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    const canvasElement = document.querySelector('canvas') as HTMLCanvasElement;
    
    if (!videoElement || !canvasElement) {
      console.error('Camera elements not found');
      return;
    }

    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;
    
    canvasElement.width = videoWidth;
    canvasElement.height = videoHeight;

    const context = canvasElement.getContext('2d');
    if (context) {
      context.drawImage(videoElement, 0, 0, videoWidth, videoHeight);
      
      canvasElement.toBlob((blob) => {
        if (blob) {
          this.processCameraPhoto(blob);
        }
      }, 'image/jpeg', 0.8);
    }
  }

  private processCameraPhoto(blob: Blob): void {
    const reader = new FileReader();
    
    reader.onload = (e: any) => {
      const timestamp = new Date().getTime();
      const imageData = {
        name: `camera_photo_${this.questionId}_${timestamp}.jpg`,
        size: blob.size,
        preview: e.target.result,
        uploadedAt: new Date(),
        isExisting: false,
        source: 'camera'
      };

      this.photoCaptured.emit({
        questionId: this.questionId,
        imageData
      });

      this.closeModal();
    };

    reader.readAsDataURL(blob);
  }

  private stopCamera(): void {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => {
        track.stop();
      });
    }
  }

  closeModal(): void {
    this.stopCamera();
    this.activeModal.dismiss();
  }
}