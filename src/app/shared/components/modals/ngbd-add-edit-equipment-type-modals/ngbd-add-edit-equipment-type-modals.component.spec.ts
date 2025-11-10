import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdAddEditEquipmentTypeModalsComponent } from './ngbd-add-edit-equipment-type-modals.component';

describe('NgbdAddEditEquipmentTypeModalsComponent', () => {
  let component: NgbdAddEditEquipmentTypeModalsComponent;
  let fixture: ComponentFixture<NgbdAddEditEquipmentTypeModalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdAddEditEquipmentTypeModalsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdAddEditEquipmentTypeModalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
