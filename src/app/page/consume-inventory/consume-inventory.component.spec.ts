import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumeInventoryComponent } from './consume-inventory.component';

describe('ConsumeInventoryComponent', () => {
  let component: ConsumeInventoryComponent;
  let fixture: ComponentFixture<ConsumeInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsumeInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsumeInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
