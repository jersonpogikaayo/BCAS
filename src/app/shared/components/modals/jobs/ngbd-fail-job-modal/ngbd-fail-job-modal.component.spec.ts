import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdFailJobModalComponent } from './ngbd-fail-job-modal.component';

describe('NgbdFailJobModalComponent', () => {
  let component: NgbdFailJobModalComponent;
  let fixture: ComponentFixture<NgbdFailJobModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdFailJobModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdFailJobModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
