import { Injectable } from '@angular/core';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';
import { User } from '@models/User';
import { AuthService } from '@services/auth/auth.service';
import { Observable } from 'rxjs/internal/Observable';
import { ContentType } from '@models/Common';
import { Metadata } from '@models/Storage';

@Injectable()
export class StorageService {

  user: User;

  ref: AngularFireStorageReference;
  task: AngularFireUploadTask;
  uploadProgress$: Observable<number>;
  downloadURL$: Observable<any>;
  fileName: string;

  constructor(private afStorage: AngularFireStorage, private auth: AuthService) {
    this.auth.getCurrentUserStream().subscribe(user => this.user = user);
  }

  upload(file: File, fileType: ContentType, customMetadata: Metadata) {
    const { id, type } = customMetadata;
    const randomId = Math.random().toString(36).substring(2);
    const { shopId } = this.user;
    let location: string;
    location = `${shopId}/${type}/${id}/${fileType}/`;
    this.fileName = file.name + randomId + '.png';
    const fileLocation = location + this.fileName;

    this.ref = this.afStorage.ref(fileLocation);
    this.task = this.ref.put(file, { customMetadata });
    this.uploadProgress$ = this.task.percentageChanges();
    this.downloadURL$ = this.ref.getDownloadURL();

  }

  getUploadProgress(): Observable<number> {
    return this.uploadProgress$;
  }

  getDownloadURL(): Observable<string> {
    return this.downloadURL$;
  }
}
