import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdCannotLocateJobModalComponent } from './ngbd-cannot-locate-job-modal.component';

describe('NgbdCannotLocateJobModalComponent', () => {
  let component: NgbdCannotLocateJobModalComponent;
  let fixture: ComponentFixture<NgbdCannotLocateJobModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdCannotLocateJobModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdCannotLocateJobModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
