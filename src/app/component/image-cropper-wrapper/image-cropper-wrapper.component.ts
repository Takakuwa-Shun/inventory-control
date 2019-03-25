import { Component, ViewChild, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ImageCroppedEvent, ImageCropperComponent } from 'node_modules/ngx-image-cropper';
declare const $;

@Component({
  selector: 'app-image-cropper-wrapper',
  templateUrl: './image-cropper-wrapper.component.html',
  styleUrls: ['./image-cropper-wrapper.component.scss']
})
export class ImageCropperWrapperComponent implements OnChanges {

  private static readonly NO_IMAGE_URL = './../../../assets/no-image.png';

  @Input() public inputTitle: string = '画像';
  @Input() private _isInited: boolean;
  @Output() public loadFailed = new EventEmitter<boolean>();
  @Output() public cropped = new EventEmitter<File>();
  public imageChangedEvent: any;
  public croppedImage: string;
  public showCropper: boolean;
  private _fileName: string;

  @ViewChild(ImageCropperComponent) imageCropper: ImageCropperComponent;

  constructor(
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if(changes._isInited.currentValue) {
      this._filterInit();
    }
  }

  private _filterInit() {
    this.imageChangedEvent = '';
    this.croppedImage = ImageCropperWrapperComponent.NO_IMAGE_URL;
    this.showCropper = false;
    $('#imageUrl').val('');
  }

  public fileChangeEvent(event): void {
    if (event.srcElement.files.length === 0) {
      this.showCropper = false;
    } else {
      this.imageChangedEvent = event;
      this._fileName = event.srcElement.files[0].name;
    }
  }

  public imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    const options: FilePropertyBag = {
      type: 'image/png'
    };
    const file: File = new File([event.file], this._fileName, options);
    this.cropped.emit(file);
  }

  public imageLoaded() {
    this.showCropper = true;
  }

  public loadImageFailed () {
    this.loadFailed.emit(true);
  }

  public rotateLeft() {
    this.imageCropper.rotateLeft();
  }

  public rotateRight() {
    this.imageCropper.rotateRight();
  }
}
