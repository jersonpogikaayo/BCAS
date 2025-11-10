import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdJobsModalComponent } from './ngbd-jobs-modal.component';

describe('NgbdJobsModalComponent', () => {
  let component: NgbdJobsModalComponent;
  let fixture: ComponentFixture<NgbdJobsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdJobsModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdJobsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
