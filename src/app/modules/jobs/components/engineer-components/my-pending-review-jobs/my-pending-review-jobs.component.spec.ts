import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPendingReviewJobsComponent } from './my-pending-review-jobs.component';

describe('MyPendingReviewJobsComponent', () => {
  let component: MyPendingReviewJobsComponent;
  let fixture: ComponentFixture<MyPendingReviewJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyPendingReviewJobsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyPendingReviewJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
