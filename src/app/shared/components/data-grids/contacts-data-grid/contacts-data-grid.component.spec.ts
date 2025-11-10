import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsDataGridComponent } from './contacts-data-grid.component';

describe('ContactsDataGridComponent', () => {
  let component: ContactsDataGridComponent;
  let fixture: ComponentFixture<ContactsDataGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactsDataGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactsDataGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
