import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCompletedJobsComponent } from './my-completed-jobs.component';

describe('MyCompletedJobsComponent', () => {
  let component: MyCompletedJobsComponent;
  let fixture: ComponentFixture<MyCompletedJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyCompletedJobsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyCompletedJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
