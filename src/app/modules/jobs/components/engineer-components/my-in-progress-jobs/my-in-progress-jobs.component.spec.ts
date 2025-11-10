import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyInProgressJobsComponent } from './my-in-progress-jobs.component';

describe('MyInProgressJobsComponent', () => {
  let component: MyInProgressJobsComponent;
  let fixture: ComponentFixture<MyInProgressJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyInProgressJobsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyInProgressJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
