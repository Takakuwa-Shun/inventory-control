import { Injectable } from '@angular/core';
import { AngularFireStorage } from 'angularfire2/storage';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageService {

  constructor(
    private _storage: AngularFireStorage
  ) { }

  public saveFile(file: File, filePath: string): Observable<firebase.storage.UploadTaskSnapshot> {
    const meta: firebase.storage.UploadMetadata = {
      contentType: file.type,
    }
    return from(this._storage.upload(filePath, file, meta));
  }

  public fecthDownloadUrl(filePath: string): Observable<string> {
    const pathReference = this._storage.storage.ref(filePath);

    return from(pathReference.getDownloadURL());
  }

  public deleteFile(filePath: string): Observable<any> {
    const ref = this._storage.ref(filePath);
    return ref.delete();
  }
}
