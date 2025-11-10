import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonDatagridComponent } from './common-datagrid.component';

describe('CommonDatagridComponent', () => {
  let component: CommonDatagridComponent;
  let fixture: ComponentFixture<CommonDatagridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonDatagridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonDatagridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
