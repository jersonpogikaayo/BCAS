import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdAddEditSitesModalComponent } from './ngbd-add-edit-sites-modal.component';

describe('NgbdAddEditSitesModalComponent', () => {
  let component: NgbdAddEditSitesModalComponent;
  let fixture: ComponentFixture<NgbdAddEditSitesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdAddEditSitesModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdAddEditSitesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
