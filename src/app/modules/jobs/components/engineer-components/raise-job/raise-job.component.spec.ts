import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiseJobComponent } from './raise-job.component';

describe('RaiseJobComponent', () => {
  let component: RaiseJobComponent;
  let fixture: ComponentFixture<RaiseJobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaiseJobComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RaiseJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
