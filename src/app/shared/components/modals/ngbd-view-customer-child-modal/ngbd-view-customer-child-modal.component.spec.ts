import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdViewCustomerChildModalComponent } from './ngbd-view-customer-child-modal.component';

describe('NgbdViewCustomerChildModalComponent', () => {
  let component: NgbdViewCustomerChildModalComponent;
  let fixture: ComponentFixture<NgbdViewCustomerChildModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdViewCustomerChildModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdViewCustomerChildModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
