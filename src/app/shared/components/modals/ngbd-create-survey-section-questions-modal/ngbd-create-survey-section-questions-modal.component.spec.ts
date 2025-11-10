import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdCreateSurveySectionQuestionsModalComponent } from './ngbd-create-survey-section-questions-modal.component';

describe('NgbdCreateSurveySectionQuestionsModalComponent', () => {
  let component: NgbdCreateSurveySectionQuestionsModalComponent;
  let fixture: ComponentFixture<NgbdCreateSurveySectionQuestionsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdCreateSurveySectionQuestionsModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdCreateSurveySectionQuestionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
