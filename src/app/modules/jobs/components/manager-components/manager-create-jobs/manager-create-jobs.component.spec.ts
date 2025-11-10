import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerCreateJobsComponent } from './manager-create-jobs.component';

describe('ManagerCreateJobsComponent', () => {
  let component: ManagerCreateJobsComponent;
  let fixture: ComponentFixture<ManagerCreateJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagerCreateJobsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagerCreateJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
