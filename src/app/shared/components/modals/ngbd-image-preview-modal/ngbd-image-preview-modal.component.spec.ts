import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdImagePreviewModalComponent } from './ngbd-image-preview-modal.component';

describe('NgbdImagePreviewModalComponent', () => {
  let component: NgbdImagePreviewModalComponent;
  let fixture: ComponentFixture<NgbdImagePreviewModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdImagePreviewModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdImagePreviewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
