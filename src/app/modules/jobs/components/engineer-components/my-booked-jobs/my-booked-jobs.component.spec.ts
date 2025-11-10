import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyBookedJobsComponent } from './my-booked-jobs.component';

describe('MyBookedJobsComponent', () => {
  let component: MyBookedJobsComponent;
  let fixture: ComponentFixture<MyBookedJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyBookedJobsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyBookedJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
