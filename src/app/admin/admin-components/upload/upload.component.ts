import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContentStorage } from '@models/Common';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

  @Input() uploadProgress = 0;
  @Input() thumbnails: ContentStorage[] = [];
  @Output() fileDroppedCallback = new EventEmitter<Event>();
  @Output() fileClickedCallback = new EventEmitter<Event>();
  @Output() deleteImageCallback = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  deleteImage(path: string) {
    this.deleteImageCallback.emit(path);
  }

  onFileDropped($event: Event) {
    this.fileDroppedCallback.emit($event);
  }

  onFileClicked($event: Event) {
    this.fileClickedCallback.emit($event);
  }

}
