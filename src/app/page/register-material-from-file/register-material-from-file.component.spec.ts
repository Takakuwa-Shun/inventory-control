import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterMaterialFromFileComponent } from './register-material-from-file.component';

describe('RegisterMaterialFromFileComponent', () => {
  let component: RegisterMaterialFromFileComponent;
  let fixture: ComponentFixture<RegisterMaterialFromFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterMaterialFromFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterMaterialFromFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
