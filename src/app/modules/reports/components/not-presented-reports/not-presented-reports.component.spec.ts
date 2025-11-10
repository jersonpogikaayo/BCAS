import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotPresentedReportsComponent } from './not-presented-reports.component';

describe('NotPresentedReportsComponent', () => {
  let component: NotPresentedReportsComponent;
  let fixture: ComponentFixture<NotPresentedReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotPresentedReportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotPresentedReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
