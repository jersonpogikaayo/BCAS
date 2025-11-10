import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsHistoryComponent } from './jobs-history.component';

describe('JobsHistoryComponent', () => {
  let component: JobsHistoryComponent;
  let fixture: ComponentFixture<JobsHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobsHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
