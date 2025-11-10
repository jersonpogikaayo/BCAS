import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PausedJobsComponent } from './paused-jobs.component';

describe('PausedJobsComponent', () => {
  let component: PausedJobsComponent;
  let fixture: ComponentFixture<PausedJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PausedJobsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PausedJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
