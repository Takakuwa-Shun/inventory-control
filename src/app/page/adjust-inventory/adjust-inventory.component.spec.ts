import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustInventoryComponent } from './adjust-inventory.component';

describe('AdjustInventoryComponent', () => {
  let component: AdjustInventoryComponent;
  let fixture: ComponentFixture<AdjustInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdjustInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
