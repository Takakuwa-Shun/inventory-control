import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseInventoryComponent } from './purchase-inventory.component';

describe('PurchaseInventoryComponent', () => {
  let component: PurchaseInventoryComponent;
  let fixture: ComponentFixture<PurchaseInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
