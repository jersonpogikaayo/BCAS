import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InProgressJobsComponent } from './in-progress-jobs.component';

describe('InProgressJobsComponent', () => {
  let component: InProgressJobsComponent;
  let fixture: ComponentFixture<InProgressJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InProgressJobsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InProgressJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
