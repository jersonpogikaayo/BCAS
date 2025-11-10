import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonDatagridWidgetComponent } from './common-datagrid-widget.component';

describe('CommonDatagridWidgetComponent', () => {
  let component: CommonDatagridWidgetComponent;
  let fixture: ComponentFixture<CommonDatagridWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonDatagridWidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonDatagridWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
