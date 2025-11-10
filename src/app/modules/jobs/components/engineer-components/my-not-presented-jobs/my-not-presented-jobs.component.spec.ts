import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyNotPresentedJobsComponent } from './my-not-presented-jobs.component';

describe('MyNotPresentedJobsComponent', () => {
  let component: MyNotPresentedJobsComponent;
  let fixture: ComponentFixture<MyNotPresentedJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyNotPresentedJobsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyNotPresentedJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
