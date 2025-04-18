import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CameraSelectionService {
  private selectedIpSubject = new BehaviorSubject<string | null>(null);
  selectedIp$ = this.selectedIpSubject.asObservable();

  selectCamera(ip: string) {
    this.selectedIpSubject.next(ip);
  }
}
