import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteDataGridComponent } from './site-data-grid.component';

describe('SiteDataGridComponent', () => {
  let component: SiteDataGridComponent;
  let fixture: ComponentFixture<SiteDataGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteDataGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteDataGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
