import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteModalComponent } from './complete-modal.component';

describe('CompleteModalComponent', () => {
  let component: CompleteModalComponent;
  let fixture: ComponentFixture<CompleteModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompleteModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompleteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
