import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdAddEditSurveyComponent } from './ngbd-add-edit-survey.component';

describe('NgbdAddEditSurveyComponent', () => {
  let component: NgbdAddEditSurveyComponent;
  let fixture: ComponentFixture<NgbdAddEditSurveyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdAddEditSurveyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdAddEditSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
