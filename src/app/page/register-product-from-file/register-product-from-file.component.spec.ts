import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterProductFromFileComponent } from './register-product-from-file.component';

describe('RegisterProductFromFileComponent', () => {
  let component: RegisterProductFromFileComponent;
  let fixture: ComponentFixture<RegisterProductFromFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterProductFromFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterProductFromFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
