import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdCsvUploadModalComponent } from './ngbd-csv-upload-modal.component';

describe('NgbdCsvUploadModalComponent', () => {
  let component: NgbdCsvUploadModalComponent;
  let fixture: ComponentFixture<NgbdCsvUploadModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdCsvUploadModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdCsvUploadModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
