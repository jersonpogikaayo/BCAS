import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyUsersDataGridComponent } from './my-users-data-grid.component';

describe('MyUsersDataGridComponent', () => {
  let component: MyUsersDataGridComponent;
  let fixture: ComponentFixture<MyUsersDataGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyUsersDataGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyUsersDataGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
