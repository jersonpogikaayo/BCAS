import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdViewJobsDataGridModalComponent } from './ngbd-view-jobs-data-grid-modal.component';

describe('NgbdViewJobsDataGridModalComponent', () => {
  let component: NgbdViewJobsDataGridModalComponent;
  let fixture: ComponentFixture<NgbdViewJobsDataGridModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdViewJobsDataGridModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdViewJobsDataGridModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
