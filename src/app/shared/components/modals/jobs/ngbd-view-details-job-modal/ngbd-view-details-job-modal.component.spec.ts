import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdViewDetailsJobModalComponent } from './ngbd-view-details-job-modal.component';

describe('NgbdViewDetailsJobModalComponent', () => {
  let component: NgbdViewDetailsJobModalComponent;
  let fixture: ComponentFixture<NgbdViewDetailsJobModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdViewDetailsJobModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdViewDetailsJobModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
