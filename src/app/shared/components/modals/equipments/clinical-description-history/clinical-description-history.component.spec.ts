import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicalDescriptionHistoryComponent } from './clinical-description-history.component';

describe('ClinicalDescriptionHistoryComponent', () => {
  let component: ClinicalDescriptionHistoryComponent;
  let fixture: ComponentFixture<ClinicalDescriptionHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClinicalDescriptionHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClinicalDescriptionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
