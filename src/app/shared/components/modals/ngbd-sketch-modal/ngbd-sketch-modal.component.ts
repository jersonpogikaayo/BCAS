import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-ngbd-sketch-modal',
  templateUrl: './ngbd-sketch-modal.component.html',
  styleUrls: ['./ngbd-sketch-modal.component.scss']
})
export class NgbdSketchModalComponent implements OnInit {
  @Input() questionId!: number;
  @Input() questionTypeId!: number;
  @Input() existingSketch?: string; // Base64 image data
  @Output() sketchSaved = new EventEmitter<{questionId: number, sketchData: string}>();
  
  @ViewChild('sketchCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  isDrawing = false;
  hasDrawn = false;
  
  // Drawing properties
  brushSize = 5;
  brushColor = '#000000';
  canvasWidth = 0;
  canvasHeight = 0;
  showGrid = false;
  canUndo = false;
  
  // Drawing state
  private strokes: ImageData[] = [];
  private currentPath: {x: number, y: number}[] = [];
  
  // Quick colors
  quickColors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];


  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {
    this.setupCanvas();
    this.loadExistingSketch();
  }

  ngOnDestroy() {
  }

  private setupCanvas(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    // Set canvas size
    this.resizeCanvas();
    
    // Setup drawing context
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.updateBrushSettings();
    
    // Add event listeners
    this.addEventListeners();
    
    // Initial state save
    this.saveState();
    
    console.log('✅ Sketch canvas initialized');
  }

  private resizeCanvas(): void {
    const container = this.canvas.parentElement!;
    this.canvasWidth = container.clientWidth;
    this.canvasHeight = container.clientHeight;
    
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    
    // Fill with white background
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  private addEventListeners(): void {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    this.canvas.addEventListener('mousemove', this.draw.bind(this));
    this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
    this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
    
    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouch.bind(this));
    this.canvas.addEventListener('touchmove', this.handleTouch.bind(this));
    this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));
    
    // Prevent default touch behavior
    this.canvas.addEventListener('touchstart', (e) => e.preventDefault());
    this.canvas.addEventListener('touchmove', (e) => e.preventDefault());
  }

  private startDrawing(event: MouseEvent): void {
    this.isDrawing = true;
    this.hasDrawn = true;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.currentPath = [{x, y}];
  }

  private draw(event: MouseEvent): void {
    if (!this.isDrawing) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    
    this.currentPath.push({x, y});
  }

  private stopDrawing(): void {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.ctx.beginPath();
      this.saveState();
    }
  }

  private handleTouch(event: TouchEvent): void {
    event.preventDefault();
    
    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    if (event.type === 'touchstart') {
      this.isDrawing = true;
      this.hasDrawn = true;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.currentPath = [{x, y}];
    } else if (event.type === 'touchmove' && this.isDrawing) {
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
      this.currentPath.push({x, y});
    }
  }

  private saveState(): void {
    this.strokes.push(this.ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight));
    this.canUndo = this.strokes.length > 1;
  }

  private loadExistingSketch(): void {
    if (this.existingSketch) {
      const img = new Image();
      img.onload = () => {
        this.ctx.drawImage(img, 0, 0, this.canvasWidth, this.canvasHeight);
        this.hasDrawn = true;
        this.saveState();
      };
      img.src = this.existingSketch;
    }
  }

  updateBrushSize(): void {
    this.updateBrushSettings();
  }

  updateBrushColor(): void {
    this.updateBrushSettings();
  }

  private updateBrushSettings(): void {
    this.ctx.strokeStyle = this.brushColor;
    this.ctx.lineWidth = this.brushSize;
  }

  setQuickColor(color: string): void {
    this.brushColor = color;
    this.updateBrushColor();
  }

  undoLastStroke(): void {
    if (this.strokes.length > 1) {
      this.strokes.pop(); // Remove current state
      const previousState = this.strokes[this.strokes.length - 1];
      this.ctx.putImageData(previousState, 0, 0);
      this.canUndo = this.strokes.length > 1;
    }
  }

  toggleGrid(): void {
    this.showGrid = !this.showGrid;
    this.drawGrid();
  }

  private drawGrid(): void {
    if (this.showGrid) {
      const gridSize = 20;
      this.ctx.save();
      this.ctx.strokeStyle = '#E5E5E5';
      this.ctx.lineWidth = 1;
      this.ctx.globalAlpha = 0.5;
      
      // Vertical lines
      for (let x = 0; x <= this.canvasWidth; x += gridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.canvasHeight);
        this.ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y <= this.canvasHeight; y += gridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.canvasWidth, y);
        this.ctx.stroke();
      }
      
      this.ctx.restore();
    }
  }

  clearCanvas(): void {
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.strokes = [];
    this.hasDrawn = false;
    this.canUndo = false;
    this.saveState();
  }

  saveSketch(): void {
    // Convert canvas to base64
    const sketchData = this.canvas.toDataURL('image/png', 0.8);
    
    this.sketchSaved.emit({
      questionId: this.questionId,
      sketchData: sketchData
    });
    
    this.activeModal.close();
  }

  cancelSketch(): void {
    this.activeModal.dismiss();
  }

}
