import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SurveyProcessService } from 'src/app/core/services/common/survey-process.service';

@Component({
  selector: 'app-ngbd-image-preview-modal',
  templateUrl: './ngbd-image-preview-modal.component.html',
  styleUrls: ['./ngbd-image-preview-modal.component.scss']
})
export class NgbdImagePreviewModalComponent implements OnInit {
  @Input() image: any;
  @Input() questionId: number = 0;
  @Input() allImages: any[] = [];
  
  currentImageIndex: number = 0;
  currentImage: any;

  constructor(
    public activeModal: NgbActiveModal,
    public surveyProcessService: SurveyProcessService
  ) {}

  ngOnInit(): void {
    this.currentImage = this.image;
    this.currentImageIndex = this.allImages.findIndex(img => img.name === this.image.name);
  }

  previousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
      this.currentImage = this.allImages[this.currentImageIndex];
    }
  }

  nextImage(): void {
    if (this.currentImageIndex < this.allImages.length - 1) {
      this.currentImageIndex++;
      this.currentImage = this.allImages[this.currentImageIndex];
    }
  }

  hasPrevious(): boolean {
    return this.currentImageIndex > 0;
  }

  hasNext(): boolean {
    return this.currentImageIndex < this.allImages.length - 1;
  }

  downloadImage(): void {
    const link = document.createElement('a');
    link.href = this.currentImage.preview;
    link.download = this.currentImage.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  close(): void {
    this.activeModal.dismiss();
  }
}