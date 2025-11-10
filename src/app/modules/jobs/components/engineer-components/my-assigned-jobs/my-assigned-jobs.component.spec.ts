import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAssignedJobsComponent } from './my-assigned-jobs.component';

describe('MyAssignedJobsComponent', () => {
  let component: MyAssignedJobsComponent;
  let fixture: ComponentFixture<MyAssignedJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyAssignedJobsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyAssignedJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
