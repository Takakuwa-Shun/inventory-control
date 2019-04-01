import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable, from, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageService {

  private objDownloadUrl = {};

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
    if(this.objDownloadUrl[filePath]) {
      return of(this.objDownloadUrl[filePath]);
    }

    const pathReference = this._storage.storage.ref(filePath);

    return from(pathReference.getDownloadURL()).pipe(
      tap((url: string) => {
        this.objDownloadUrl[filePath] = url;
      })
    );
  }

  public deleteFile(filePath: string): Observable<any> {
    const ref = this._storage.ref(filePath);
    return ref.delete();
  }
}
