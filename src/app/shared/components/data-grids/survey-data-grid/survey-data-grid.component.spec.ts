import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyDataGridComponent } from './survey-data-grid.component';

describe('SurveyDataGridComponent', () => {
  let component: SurveyDataGridComponent;
  let fixture: ComponentFixture<SurveyDataGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyDataGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyDataGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
