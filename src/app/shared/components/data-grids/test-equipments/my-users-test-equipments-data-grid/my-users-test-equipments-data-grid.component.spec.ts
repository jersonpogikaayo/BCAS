import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyUsersTestEquipmentsDataGridComponent } from './my-users-test-equipments-data-grid.component';

describe('MyUsersTestEquipmentsDataGridComponent', () => {
  let component: MyUsersTestEquipmentsDataGridComponent;
  let fixture: ComponentFixture<MyUsersTestEquipmentsDataGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyUsersTestEquipmentsDataGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyUsersTestEquipmentsDataGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
