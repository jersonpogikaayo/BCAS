import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPausedJobsComponent } from './my-paused-jobs.component';

describe('MyPausedJobsComponent', () => {
  let component: MyPausedJobsComponent;
  let fixture: ComponentFixture<MyPausedJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyPausedJobsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyPausedJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
