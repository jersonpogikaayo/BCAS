import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedJobsComponent } from './completed-jobs.component';

describe('CompletedJobsComponent', () => {
  let component: CompletedJobsComponent;
  let fixture: ComponentFixture<CompletedJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompletedJobsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompletedJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
