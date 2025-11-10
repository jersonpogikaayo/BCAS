import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentsTypeDataGridComponent } from './equipments-type-data-grid.component';

describe('EquipmentsTypeDataGridComponent', () => {
  let component: EquipmentsTypeDataGridComponent;
  let fixture: ComponentFixture<EquipmentsTypeDataGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EquipmentsTypeDataGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentsTypeDataGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
