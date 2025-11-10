import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdSignOffJobModalComponent } from './ngbd-sign-off-job-modal.component';

describe('NgbdSignOffJobModalComponent', () => {
  let component: NgbdSignOffJobModalComponent;
  let fixture: ComponentFixture<NgbdSignOffJobModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdSignOffJobModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdSignOffJobModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
