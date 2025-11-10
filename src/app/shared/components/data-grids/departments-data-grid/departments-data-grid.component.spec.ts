import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentsDataGridComponent } from './departments-data-grid.component';

describe('DepartmentsDataGridComponent', () => {
  let component: DepartmentsDataGridComponent;
  let fixture: ComponentFixture<DepartmentsDataGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DepartmentsDataGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartmentsDataGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
