import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsSummaryComponent } from './jobs-summary.component';

describe('JobsSummaryComponent', () => {
  let component: JobsSummaryComponent;
  let fixture: ComponentFixture<JobsSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobsSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
