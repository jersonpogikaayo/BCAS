import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersDataGridComponent } from './customers-data-grid.component';

describe('CustomersDataGridComponent', () => {
  let component: CustomersDataGridComponent;
  let fixture: ComponentFixture<CustomersDataGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomersDataGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomersDataGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
