import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveEquipmentComponent } from './approve-equipment.component';

describe('ApproveEquipmentComponent', () => {
  let component: ApproveEquipmentComponent;
  let fixture: ComponentFixture<ApproveEquipmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveEquipmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveEquipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
