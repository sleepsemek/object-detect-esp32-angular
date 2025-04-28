import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CameraStreamService {
  private restartStreamSubject = new Subject<void>();
  restart$ = this.restartStreamSubject.asObservable();

  stopStream(imgElement: HTMLImageElement) {
    imgElement.removeAttribute('src');
  }

  startStream(imgElement: HTMLImageElement, ip: string | null) {
    if (!ip) {
      return;
    }
    imgElement.src = `http://${ip}/stream`;
  }

  requestRestart() {
    this.restartStreamSubject.next();
  }
}

