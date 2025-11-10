import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdViewEquipmentDetailsModalComponent } from './ngbd-view-equipment-details-modal.component';

describe('NgbdViewEquipmentDetailsModalComponent', () => {
  let component: NgbdViewEquipmentDetailsModalComponent;
  let fixture: ComponentFixture<NgbdViewEquipmentDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdViewEquipmentDetailsModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdViewEquipmentDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
