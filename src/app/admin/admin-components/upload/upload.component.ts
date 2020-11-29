import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ContentStorage } from '@models/Common';
import { AlertService } from '@services/alert/alert.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

  @Input() show: boolean;
  @Input() title: string;
  @Input() aspectRatio = 1 / 1;
  @Input() uploadProgress = 0;
  @Input() thumbnails: ContentStorage[] = [];
  @Output() imageCallback = new EventEmitter<any>();
  @Output() deleteImageCallback = new EventEmitter<string>();

  fileName: string;
  showModal = false;
  imageFile: File;
  croppedImage: string;

  @ViewChild('cardInput') cardInput: ElementRef;
  @ViewChild('bodyInput') bodyInput: ElementRef;

  constructor(private alert: AlertService) { }

  ngOnInit(): void {
  }

  deleteImage(path: string) {
    this.deleteImageCallback.emit(path);
  }

  async setImage() {
    const file = await this.dataUrlToFile(this.croppedImage, this.fileName);
    if (file.size > 2999999) {
      this.alert.alert({ message: 'Image should not be greater than 3MB'});
      return;
    }
    this.imageCallback.emit(file);
    this.reset();
  }

  onFileDropped($event: any) {
    if ($event && $event[0]) {
      this.openCropper($event[0]);
    }
  }

  onFileClicked($event: any) {
    if ($event && $event.target && $event.target.files && $event.target.files[0]) {
      this.openCropper($event.target.files[0]);
    }
  }

  openCropper(file: File) {
    this.imageFile = file;
    this.fileName = file.name;
    this.showModal = true;
  }

  closeCropper($event: boolean) {
    if (!$event) {
      this.reset();
    }
  }

  reset() {
    this.showModal = false;
    this.imageFile = null;
    this.fileName = '';
    if (this.cardInput) {
      this.cardInput.nativeElement.value = '';
    }
    if (this.bodyInput) {
      this.bodyInput.nativeElement.value = '';
    }
  }

  imageCropped(event: any) {
    this.croppedImage = event.base64;
  }

  async dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
    const res: Response = await fetch(dataUrl);
    const blob: Blob = await res.blob();
    return new File([blob], fileName, { type: 'image/png' });
  }

}
