import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyProcessComponent } from './survey-process.component';

describe('SurveyProcessComponent', () => {
  let component: SurveyProcessComponent;
  let fixture: ComponentFixture<SurveyProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyProcessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
