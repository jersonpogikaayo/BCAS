import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdSketchModalComponent } from './ngbd-sketch-modal.component';

describe('NgbdSketchModalComponent', () => {
  let component: NgbdSketchModalComponent;
  let fixture: ComponentFixture<NgbdSketchModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdSketchModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdSketchModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
