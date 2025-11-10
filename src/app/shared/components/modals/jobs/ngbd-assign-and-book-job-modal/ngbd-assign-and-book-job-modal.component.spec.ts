import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdAssignAndBookJobModalComponent } from './ngbd-assign-and-book-job-modal.component';

describe('NgbdAssignAndBookJobModalComponent', () => {
  let component: NgbdAssignAndBookJobModalComponent;
  let fixture: ComponentFixture<NgbdAssignAndBookJobModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdAssignAndBookJobModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdAssignAndBookJobModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
