import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { SignaturePad } from 'angular2-signaturepad';

@Component({
  selector: 'app-signature-pad',
  templateUrl: './signature-pad.component.html',
  styleUrls: ['./signature-pad.component.scss']
})
export class SignaturePadComponent implements AfterViewInit, OnInit {
  
  @ViewChild(SignaturePad) signaturePad!: SignaturePad;
  @ViewChild('signatureContainer') signatureContainer!: ElementRef;
  
  // Essential Inputs
  @Input() isSketch: boolean = false;
  @Input() defaultValue: string = '';
  @Input() isDisabled: boolean = false;
  
  // Essential Outputs
  @Output() imageUrl = new EventEmitter<string>();
  @Output() signatureChanged = new EventEmitter<boolean>();
  @Output() cleared = new EventEmitter<void>();
  @Output() beginSign = new EventEmitter<void>();
  @Output() endSign = new EventEmitter<void>();

  // Component state
  public hasSignature: boolean = false;
  public signaturePadOptions: any = {
    minWidth: 2,
    maxWidth: 4,
    canvasWidth: 1000,
    canvasHeight: 350,
    backgroundColor: '#ffffff',
    penColor: '#000000'
  };

  ngOnInit(): void {
    console.log(this.isDisabled)
    console.log('SignaturePadComponent initialized with default value:', this.defaultValue);

    if (this.defaultValue) {
      this.hasSignature = true;
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initSignaturePad();
    }, 300);
  }

  /**
   * Initialize signature pad
   */
  private initSignaturePad(): void {
    if (this.signaturePad) {
      // Apply options
      Object.keys(this.signaturePadOptions).forEach(key => {
        this.signaturePad.set(key, this.signaturePadOptions[key]);
      });

      // Clear and load default
      this.signaturePad.clear();
      this.loadDefault();
    }
  }

  /**
   * Load default value
   */
  loadDefault(): any {
    if (this.defaultValue && this.defaultValue.trim() !== '') {
      setTimeout(() => {
        if (this.signaturePad) {
          this.signaturePad.fromDataURL(this.defaultValue);
          this.updateState();
        }
      }, 100);
    }
  }

  /**
   * Update signature state
   */
  private updateState(): void {
    if (!this.signaturePad) return;
    
    const wasEmpty = !this.hasSignature;
    this.hasSignature = !this.signaturePad.isEmpty();

    if (wasEmpty !== !this.hasSignature) {
      this.signatureChanged.emit(this.hasSignature);
    }
  }

  /**
   * Handle signature begin
   */
  onBeginSign(): void {
    if (!this.isDisabled) {
      this.beginSign.emit();
    }
  }

  /**
   * Handle signature end
   */
  onEndSign(): void {
    if (!this.isDisabled) {
      this.updateState();
      
      if (this.hasSignature && this.signaturePad) {
        const dataUrl = this.signaturePad.toDataURL('image/png', 0.9);
        this.imageUrl.emit(dataUrl);
      } else {
        this.imageUrl.emit('');
      }
      
      this.endSign.emit();
    }
  }

  /**
   * Clear signature
   */
  clear(): void {
    if (this.signaturePad && !this.isDisabled) {
      this.signaturePad.clear();
      this.hasSignature = false;
      this.signatureChanged.emit(false);
      this.imageUrl.emit('');
      this.cleared.emit();
    }
  }

  /**
   * Undo last stroke
   */
  undo(): void {
    if (this.signaturePad && !this.isDisabled) {
      const data = this.signaturePad.toData();
      if (data && data.length > 0) {
        data.pop();
        this.signaturePad.fromData(data);
        this.updateState();
        
        if (this.hasSignature) {
          this.imageUrl.emit(this.signaturePad.toDataURL('image/png', 0.9));
        } else {
          this.imageUrl.emit('');
        }
      }
    }
  }

  getImageSrc(): string {
    if (!this.defaultValue) return '';
    
    // Ensure proper base64 format
    if (this.defaultValue.startsWith('data:image')) {
      return this.defaultValue;
    } else {
      return `data:image/png;base64,${this.defaultValue}`;
    }
  }
}