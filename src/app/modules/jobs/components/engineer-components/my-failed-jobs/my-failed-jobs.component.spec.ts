import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyFailedJobsComponent } from './my-failed-jobs.component';

describe('MyFailedJobsComponent', () => {
  let component: MyFailedJobsComponent;
  let fixture: ComponentFixture<MyFailedJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyFailedJobsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyFailedJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
