import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsTypeComponent } from './jobs-type.component';

describe('JobsTypeComponent', () => {
  let component: JobsTypeComponent;
  let fixture: ComponentFixture<JobsTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobsTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
