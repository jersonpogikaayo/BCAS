import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdAddEditCustomerModalComponent } from './ngbd-add-edit-customer-modal.component';

describe('NgbdAddEditCustomerModalComponent', () => {
  let component: NgbdAddEditCustomerModalComponent;
  let fixture: ComponentFixture<NgbdAddEditCustomerModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdAddEditCustomerModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdAddEditCustomerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
