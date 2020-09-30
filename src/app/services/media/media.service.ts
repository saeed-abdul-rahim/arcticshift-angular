import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import imageCompression from 'browser-image-compression';
import Thumbnail from './Thumbnail';
import { Observable, Observer } from 'rxjs';

@Injectable()
export class MediaService {

  thumbnailType = 'image/png';

  constructor(
    @Inject(DOCUMENT) private document: Document
  ) { }

  public promptForVideo(): Promise<File> {
    return new Promise<File>((resolve, reject) => {
      const fileInput: HTMLInputElement = this.document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'video/*';
      fileInput.setAttribute('capture', 'camera');
      fileInput.addEventListener('error', event => {
        reject(event.error);
      });
      fileInput.addEventListener('change', event => {
        resolve(fileInput.files[0]);
      });
      fileInput.click();
    });
  }

  public generateVideoThumbnail(videoFile: Blob): Promise<Thumbnail> {
    const video: HTMLVideoElement = this.document.createElement('video');
    const canvas: HTMLCanvasElement = this.document.createElement('canvas');
    const context: CanvasRenderingContext2D = canvas.getContext('2d');
    return new Promise<Thumbnail>((resolve, reject) => {
      canvas.addEventListener('error',  reject);
      video.addEventListener('error',  reject);
      video.addEventListener('canplay', event => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const url = canvas.toDataURL();
        canvas.toBlob(blob => resolve({ url, blob }), this.thumbnailType, 0.85);
      });
      if (videoFile.type) {
        video.setAttribute('type', videoFile.type);
      }
      video.preload = 'auto';
      video.src = window.URL.createObjectURL(videoFile);
      video.load();
    });
  }

  public async generateImageThumbnail(imageFile: Blob, maxWidthOrHeight?: number): Promise<Thumbnail> {
    const options = {
      maxSizeMB: 0.07,
      maxWidthOrHeight: maxWidthOrHeight ? maxWidthOrHeight : 1024,
      useWebWorker: true,
    };
    const blob = await imageCompression(imageFile, options);
    const url = await imageCompression.getDataUrlFromFile(blob);
    return { url, blob };
  }

  createBlobImageFile(url: string): void {
    this.dataURItoBlob(url).subscribe((blob: Blob) => {
      const imageBlob: Blob = blob;
      const imageName: string = this.generateName();
      const imageFile: File = new File([imageBlob], imageName, {
        type: this.thumbnailType
      });
      return window.URL.createObjectURL(imageFile);
    });
  }

    /* Method to convert Base64Data Url as Image Blob */
  dataURItoBlob(dataURI: string): Observable<Blob> {
    return new Observable((observer: Observer<Blob>) => {
      const byteString: string = window.atob(dataURI.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''));
      const arrayBuffer: ArrayBuffer = new ArrayBuffer(byteString.length);
      const int8Array: Uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        int8Array[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([int8Array], { type: this.thumbnailType });
      observer.next(blob);
      observer.complete();
    });
  }

  generateName(): string {
    const date: number = new Date().valueOf();
    let text = '';
    const possibleText =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
      text += possibleText.charAt(
        Math.floor(Math.random() * possibleText.length)
      );
    }
    // Replace extension according to your media type like this
    return date + '.' + text + '.png';
  }

}
