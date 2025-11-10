import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentsModelDataGridComponent } from './equipments-model-data-grid.component';

describe('EquipmentsModelDataGridComponent', () => {
  let component: EquipmentsModelDataGridComponent;
  let fixture: ComponentFixture<EquipmentsModelDataGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EquipmentsModelDataGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentsModelDataGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
