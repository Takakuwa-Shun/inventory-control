import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalConfig } from './../../../environments/local.config';
declare var gapi: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleDriveService  {

  private static readonly _API = LocalConfig.URL;

  private static readonly _CLIENT_ID = '400407113405-6qg1fs3hkchsmm9es2uss4l0m5ejru5f.apps.googleusercontent.com';
  private static readonly _API_KEY = 'AIzaSyDrpZPgFT0ZHZ75TIsR3Q0bX61qyIhLOhk';
  
  // Array of API discovery doc URLs for APIs used by the quickstart
  private static readonly _DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

  // Authorization scopes required by the API; multiple scopes can be
  // included, separated by spaces.
  private static readonly _SCOPES = 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file';

  private static _authToken;
  private static _gapiClient;
  private static _gapiAuth2;
  private static _loaded: boolean = false;

  constructor(private _http : HttpClient) {
    this._load();
  }

  public saveImageFile(file: any, name: string, type: string): Observable<HttpResponse<object>> {

    // 「image」フォルダー
    const folder = ['1zhDNZgmZkfUKZUtbzo72_6VrsKMkDIzC'];

    const base64Data = window.btoa(file);

    const dataHeader = 
        'Content-Type: ' + type + '\r\n'
      + 'Content-Transfer-Encoding: base64';

    const metaData = {
      'mimeType': type,
      'name': name,
      'parents': folder
    }

    return this._saveFile(base64Data, dataHeader, metaData);
  }

  public test() {
    this._listFiles();
  }

  /**
   *  On load, called to load the auth2 library and API client library.
   *  Asynchronously loads the gapi libraries requested. Use this method to load the gapi.client library.
   */
  private _load(): void {
    // const params: HttpParams = new HttpParams().set('settingId', '1');
    // this._http.get<GoogleSettings>(GoogleDriveService._API + '/setting/google', {observe: 'response', params: params})
    //   .subscribe((res: HttpResponse<GoogleSettings>) => {
        // console.log(res);
        gapi.load('client:auth2', () => {
          gapi.client.init({
            apiKey: GoogleDriveService._API_KEY,
            clientId: GoogleDriveService._CLIENT_ID,
            discoveryDocs: GoogleDriveService._DISCOVERY_DOCS,
            scope: GoogleDriveService._SCOPES
          }).then(() => {
            GoogleDriveService._gapiAuth2 = gapi.auth2.getAuthInstance();
            GoogleDriveService._gapiClient = gapi.client;
            GoogleDriveService._authToken = gapi.client.getToken().access_token;
            console.log(gapi);
            console.log(GoogleDriveService._gapiAuth2);
            console.log(GoogleDriveService._gapiClient);
            console.log(GoogleDriveService._authToken);
    
            // scopeを変えた場合はログインし直す
            if(!GoogleDriveService._gapiAuth2.isSignedIn.get()) {
              GoogleDriveService._gapiAuth2.signIn();
            }
            GoogleDriveService._loaded = true;
    
          }, (error) => {
            console.log(JSON.stringify(error, null, 2));
          });
        });
      // }, (err) => {
      //   console.log(err);
      // });
  }

/**
* Remove files.
*/
public removeFile (fieldId: string): Observable<HttpResponse<object>> {
  return this._http.delete<object>('https://www.googleapis.com/drive/v3/files/' + fieldId,
    {
      observe: 'response',
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + GoogleDriveService._authToken
      })
    });
}

  // private async _checkLoaded() {
  //   if(GoogleDriveService._loaded) {
  //     return;
  //   } else {
  //     await this._sleepByPromise(1);
  //     return this._checkLoaded();
  //   }
  // }

  // private _sleepByPromise(sec) {
  //   return new Promise(resolve => setTimeout(resolve, sec*1000));
  // }

  /**
   * Print files.
   */
  private _listFiles(): void {
    GoogleDriveService._gapiClient.drive.files.list({
      'pageSize': 10,
      'fields': "nextPageToken, files(id, name)"
    }).then((response) => {
      const files = response.result.files;
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          console.log(file.name + ' (' + file.id + ')');
        }
      } else {
        console.log('No files found.');
      }
    });
  }

  /**
  * Save files.
  */
  private _saveFile(data: any, dataHeader: string, metaData: object): Observable<HttpResponse<object>> {
    const boundary = 'foo_bar_baz';

    const body = '--' + boundary + '\r\n'
      + 'Content-Type: application/json; charset=UTF-8\r\n'
      + '\r\n'
      + JSON.stringify(metaData) + '\r\n'
      + '\r\n'
      + '--' + boundary + '\r\n'
      + dataHeader + '\r\n'
      + '\r\n'
      + data + '\r\n'
      + '\r\n'
      + '--' + boundary + '--';

    return this._http.post<object>('https://www.googleapis.com/upload/drive/v3/files',
      body,
      {
        observe: 'response',
        params: new HttpParams().set('uploadType', 'multipart'),
        headers: new HttpHeaders({
          'Authorization': 'Bearer ' + GoogleDriveService._authToken,
          'Content-Type':  'multipart/related; boundary=' + boundary,
        }),
      });
  }
}
