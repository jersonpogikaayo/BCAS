import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConditionalScaleHistoryComponent } from './conditional-scale-history.component';

describe('ConditionalScaleHistoryComponent', () => {
  let component: ConditionalScaleHistoryComponent;
  let fixture: ComponentFixture<ConditionalScaleHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConditionalScaleHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConditionalScaleHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
