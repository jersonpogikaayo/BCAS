import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdAddEditExcelTemplateComponent } from './ngbd-add-edit-excel-template.component';

describe('NgbdAddEditExcelTemplateComponent', () => {
  let component: NgbdAddEditExcelTemplateComponent;
  let fixture: ComponentFixture<NgbdAddEditExcelTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdAddEditExcelTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdAddEditExcelTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
