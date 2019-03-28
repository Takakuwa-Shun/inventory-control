import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ValueShareService {

  public loadingSubject = new Subject<boolean>();
  public completeModalSubject = new Subject<string[]>();

  constructor() { }

  public setLoading(show: boolean) {
    this.loadingSubject.next(show);
  }

  public setCompleteModal(body: string, timeoutMs=3000, btnType='btn-danger') {
    this.completeModalSubject.next([body, btnType, timeoutMs.toString()]);
  }
}
