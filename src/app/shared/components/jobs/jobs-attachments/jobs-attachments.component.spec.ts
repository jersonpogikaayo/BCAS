import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsAttachmentsComponent } from './jobs-attachments.component';

describe('JobsAttachmentsComponent', () => {
  let component: JobsAttachmentsComponent;
  let fixture: ComponentFixture<JobsAttachmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobsAttachmentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
