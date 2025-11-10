import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelTemplatesDataGridComponent } from './excel-templates-data-grid.component';

describe('ExcelTemplatesDataGridComponent', () => {
  let component: ExcelTemplatesDataGridComponent;
  let fixture: ComponentFixture<ExcelTemplatesDataGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExcelTemplatesDataGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExcelTemplatesDataGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
