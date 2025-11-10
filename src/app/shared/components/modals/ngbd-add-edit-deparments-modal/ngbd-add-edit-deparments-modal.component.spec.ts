import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdAddEditDeparmentsModalComponent } from './ngbd-add-edit-deparments-modal.component';

describe('NgbdAddEditDeparmentsModalComponent', () => {
  let component: NgbdAddEditDeparmentsModalComponent;
  let fixture: ComponentFixture<NgbdAddEditDeparmentsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdAddEditDeparmentsModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdAddEditDeparmentsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
