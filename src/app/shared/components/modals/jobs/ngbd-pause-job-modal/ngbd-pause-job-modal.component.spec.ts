import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdPauseJobModalComponent } from './ngbd-pause-job-modal.component';

describe('NgbdPauseJobModalComponent', () => {
  let component: NgbdPauseJobModalComponent;
  let fixture: ComponentFixture<NgbdPauseJobModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdPauseJobModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdPauseJobModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
