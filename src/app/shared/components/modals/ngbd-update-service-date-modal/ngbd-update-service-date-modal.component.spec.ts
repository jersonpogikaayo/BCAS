import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdUpdateServiceDateModalComponent } from './ngbd-update-service-date-modal.component';

describe('NgbdUpdateServiceDateModalComponent', () => {
  let component: NgbdUpdateServiceDateModalComponent;
  let fixture: ComponentFixture<NgbdUpdateServiceDateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdUpdateServiceDateModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdUpdateServiceDateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
