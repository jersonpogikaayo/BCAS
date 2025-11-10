import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveySelectionDataGridComponent } from './survey-selection-data-grid.component';

describe('SurveySelectionDataGridComponent', () => {
  let component: SurveySelectionDataGridComponent;
  let fixture: ComponentFixture<SurveySelectionDataGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveySelectionDataGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveySelectionDataGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
