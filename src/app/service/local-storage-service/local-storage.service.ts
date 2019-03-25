import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  private canUse: boolean;

  constructor() {
    this.canUse = this.check();
  }

  check(): boolean {
    return ('localStorage' in window) && (window.localStorage !== null);
  }

  getItem(path: string): string {
    if (this.canUse) {
      return window.localStorage.getItem(path);
    }
    return null;
  }

  getObject(path: string) {
    if (this.canUse) {
      return JSON.parse(window.localStorage.getItem(path));
    }
    return null;
  }

  setItem(path: string, data: string): void {
    if (this.canUse) {
      window.localStorage.setItem(path, data);
    }
  }

  setObject(path: string, data: object): void {
    if (this.canUse) {
      window.localStorage.setItem(path, JSON.stringify(data));
    }
  }

  removeItem(path: string): void {
    if (this.canUse) {
      window.localStorage.removeItem(path);
    }
  }

}
