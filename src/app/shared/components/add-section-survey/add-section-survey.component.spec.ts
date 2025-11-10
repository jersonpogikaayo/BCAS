import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSectionSurveyComponent } from './add-section-survey.component';

describe('AddSectionSurveyComponent', () => {
  let component: AddSectionSurveyComponent;
  let fixture: ComponentFixture<AddSectionSurveyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddSectionSurveyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSectionSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
