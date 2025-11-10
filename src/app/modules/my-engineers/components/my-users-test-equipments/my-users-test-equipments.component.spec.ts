import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyUsersTestEquipmentsComponent } from './my-users-test-equipments.component';

describe('MyUsersTestEquipmentsComponent', () => {
  let component: MyUsersTestEquipmentsComponent;
  let fixture: ComponentFixture<MyUsersTestEquipmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyUsersTestEquipmentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyUsersTestEquipmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
