import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentsDataGridComponent } from './equipments-data-grid.component';

describe('EquipmentsDataGridComponent', () => {
  let component: EquipmentsDataGridComponent;
  let fixture: ComponentFixture<EquipmentsDataGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EquipmentsDataGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentsDataGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
