import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdAddEditMyUsersModalComponent } from './ngbd-add-edit-my-users-modal.component';

describe('NgbdAddEditMyUsersModalComponent', () => {
  let component: NgbdAddEditMyUsersModalComponent;
  let fixture: ComponentFixture<NgbdAddEditMyUsersModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdAddEditMyUsersModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdAddEditMyUsersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
