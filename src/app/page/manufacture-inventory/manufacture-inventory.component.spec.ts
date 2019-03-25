import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufactureInventoryComponent } from './manufacture-inventory.component';

describe('ManufactureInventoryComponent', () => {
  let component: ManufactureInventoryComponent;
  let fixture: ComponentFixture<ManufactureInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManufactureInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManufactureInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
