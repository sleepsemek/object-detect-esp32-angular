import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { switchMap, tap } from 'rxjs/operators';

export interface InferenceData {
  timestamp: string;
  data: {
    person?: number[][];
    [key: string]: number[][] | undefined;
  };
}

export interface CameraInference {
  local_ip: string;
  inferences: InferenceData[];
}

export interface CameraEntry {
  local_ip: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = 'http://localhost:3000/api';
  private cameraInferenceSubject = new BehaviorSubject<CameraInference[]>([]);
  private camerasSubject = new BehaviorSubject<CameraEntry[]>([]);

  public cameraInferences$ = this.cameraInferenceSubject.asObservable();
  public cameras$ = this.camerasSubject.asObservable();

  constructor(private http: HttpClient) {
    this.startPolling();
  }

  private startPolling(): void {
    timer(0, 1000).pipe(
      switchMap(() => this.http.get<{ results: CameraInference[] }>(`${this.apiUrl}/getResult`)),
      tap(res => {
        const merged = this.mergeResults(res.results);
        this.cameraInferenceSubject.next(merged);
        this.updateCameras(merged);
      })
    ).subscribe();
  }

  // private mergeResults(newResults: CameraInference[]): CameraInference[] {
  //   return newResults.map(newCam => {
  //     const existingCam = this.cameraInferenceSubject.value.find(c => c.address === newCam.address);
  //     return existingCam
  //       ? { ...newCam, inferences: this.mergeInferences(existingCam.inferences, newCam.inferences) }
  //       : newCam;
  //   });
  // }

  private mergeResults(newResults: CameraInference[]): CameraInference[] {
    return newResults.map(newCam => {
      const existingCam = this.cameraInferenceSubject.value.find(c => c.local_ip === newCam.local_ip);
      const mergedInferences = existingCam
        ? this.mergeInferences(existingCam.inferences, newCam.inferences)
        : newCam.inferences;

      const withZeros = this.fillMissingTimestamps(newCam.local_ip, mergedInferences);

      return {
        local_ip: newCam.local_ip,
        inferences: withZeros
      };
    });
  }

  private fillMissingTimestamps(local_ip: string, inferences: InferenceData[]): InferenceData[] {
    const now = Date.now();
    const oneDayAgo = now - 1 * 60 * 60 * 1000;
    const interval = 5000; // 5 секунд

    const sorted = [...inferences].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const filled: InferenceData[] = [];
    for(let i = 0; i < sorted.length; i++) {
      const current = new Date(sorted[i].timestamp).getTime();
      const prev = i > 0 ? new Date(sorted[i-1]?.timestamp).getTime() : null;

      if(prev && (current - prev > interval)) {
        const missingSteps = Math.floor((current - prev) / interval) - 1;
        for(let j = 1; j <= missingSteps; j++) {
          const missingTime = new Date(prev + j * interval);
          filled.push(this.createZeroEntry(missingTime));
        }
      }

      filled.push(sorted[i]);
    }

    const lastTime = sorted.length > 0
      ? new Date(sorted[sorted.length - 1].timestamp).getTime()
      : oneDayAgo;

    const missingEndSteps = Math.floor((now - lastTime) / interval);
    for(let j = 1; j <= missingEndSteps; j++) {
      const missingTime = new Date(lastTime + j * interval);
      filled.push(this.createZeroEntry(missingTime));
    }

    return filled
      .filter(inf => new Date(inf.timestamp).getTime() >= oneDayAgo)
      .filter((inf, index, self) =>
          index === self.findIndex(t =>
            t.timestamp === inf.timestamp
          )
      );
  }

  private createZeroEntry(timestamp: Date): InferenceData {
    return {
      timestamp: timestamp.toISOString(),
      data: { person: [] }
    };
  }

  // Тут оканчивается ZeroEntry популяция

  private mergeInferences(existing: InferenceData[], newInferences: InferenceData[]): InferenceData[] {
    const now = Date.now();
    const oneDayAgo = now - 1 * 60 * 60 * 1000;

    const all = [...existing, ...newInferences];

    const unique = new Map<string, InferenceData>();
    all.forEach(inf => {
      if (!unique.has(inf.timestamp)) {
        unique.set(inf.timestamp, inf);
      }
    });

    const filtered = Array.from(unique.values()).filter(inf =>
      new Date(inf.timestamp).getTime() >= oneDayAgo
    );

    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return filtered;

  }

  private updateCameras(results: CameraInference[]): void {
    const newCameras = results.map(cam => ({ local_ip: cam.local_ip }));
    const current = this.camerasSubject.value;
    const isSame = current.length === newCameras.length &&
      current.every((c, i) => c.local_ip === newCameras[i].local_ip);

    if (!isSame) {
      this.camerasSubject.next([...new Map(newCameras.map(c => [c.local_ip, c])).values()]);
    }
  }

}
