import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdAddEditContactsModalComponent } from './ngbd-add-edit-contacts-modal.component';

describe('NgbdAddEditContactsModalComponent', () => {
  let component: NgbdAddEditContactsModalComponent;
  let fixture: ComponentFixture<NgbdAddEditContactsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdAddEditContactsModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdAddEditContactsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
