import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveInventoryComponent } from './move-inventory.component';

describe('MoveInventoryComponent', () => {
  let component: MoveInventoryComponent;
  let fixture: ComponentFixture<MoveInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoveInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
