import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestEquipmentsComponent } from './test-equipments.component';

describe('TestEquipmentsComponent', () => {
  let component: TestEquipmentsComponent;
  let fixture: ComponentFixture<TestEquipmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestEquipmentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestEquipmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
