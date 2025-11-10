import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookedJobsComponent } from './booked-jobs.component';

describe('BookedJobsComponent', () => {
  let component: BookedJobsComponent;
  let fixture: ComponentFixture<BookedJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookedJobsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookedJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
