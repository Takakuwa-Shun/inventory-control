import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageCropperWrapperComponent } from './image-cropper-wrapper.component';

describe('ImageCropperWrapperComponent', () => {
  let component: ImageCropperWrapperComponent;
  let fixture: ComponentFixture<ImageCropperWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageCropperWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageCropperWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
