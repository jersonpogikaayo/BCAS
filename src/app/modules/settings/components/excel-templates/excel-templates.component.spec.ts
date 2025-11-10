import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelTemplatesComponent } from './excel-templates.component';

describe('ExcelTemplatesComponent', () => {
  let component: ExcelTemplatesComponent;
  let fixture: ComponentFixture<ExcelTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExcelTemplatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExcelTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
