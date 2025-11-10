import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationalReportsComponent } from './operational-reports.component';

describe('OperationalReportsComponent', () => {
  let component: OperationalReportsComponent;
  let fixture: ComponentFixture<OperationalReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperationalReportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationalReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
