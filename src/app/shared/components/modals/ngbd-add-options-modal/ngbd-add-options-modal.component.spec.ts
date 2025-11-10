import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdAddOptionsModalComponent } from './ngbd-add-options-modal.component';

describe('NgbdAddOptionsModalComponent', () => {
  let component: NgbdAddOptionsModalComponent;
  let fixture: ComponentFixture<NgbdAddOptionsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgbdAddOptionsModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgbdAddOptionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
