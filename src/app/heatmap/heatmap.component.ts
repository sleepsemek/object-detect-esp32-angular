import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService, CameraInference } from '../services/api.service';
import { Subscription } from 'rxjs';
import { NgForOf } from '@angular/common';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatCard, MatCardContent} from '@angular/material/card';

interface CameraData {
  local_ip: string;
  intervals: Map<number, number>;
  processedTimestamps: Set<number>;
  lastUpdate: Date;
}

@Component({
  selector: 'app-heatmap',
  standalone: true,
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.scss'],
  imports: [
    NgForOf,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatTooltipModule,
    MatCard,
    MatCardContent
  ]
})
export class HeatmapComponent implements OnInit, OnDestroy {
  private sub!: Subscription;
  cameras: CameraData[] = [];
  timeIntervals: number[] = [];
  private readonly intervalSize = 5000;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.sub = this.api.cameraInferences$.subscribe(data => {
      this.updateHeatmapData(data);
    });
  }

  private updateHeatmapData(cameras: CameraInference[]): void {
    this.processCameraData(cameras);
    this.updateTimeIntervals();
  }

  private processCameraData(cameras: CameraInference[]): void {
    const now = new Date();

    cameras.forEach(cam => {
      let camera = this.cameras.find(c => c.local_ip === cam.local_ip);

      if (!camera) {
        camera = {
          local_ip: cam.local_ip,
          intervals: new Map<number, number>(),
          processedTimestamps: new Set<number>(),
          lastUpdate: now
        };
        this.cameras.push(camera);
      }

      cam.inferences.forEach(inf => {
        const rawTimestamp = new Date(inf.timestamp).getTime();
        const timestamp = this.roundToInterval(new Date(inf.timestamp));

        if (!camera.processedTimestamps.has(rawTimestamp)) {
          const peopleCount = Object.values(inf.data).reduce((sum, detections) => sum + detections.length, 0);

          camera.intervals.set(timestamp, (camera.intervals.get(timestamp) || 0) + peopleCount);
          camera.processedTimestamps.add(rawTimestamp);
        }
      });

      camera.lastUpdate = now;
    });

    this.cleanupOldData();
  }

  private cleanupOldData(): void {
    const allIntervals = this.cameras.reduce((acc, camera) => {
      Array.from(camera.intervals.keys()).forEach(ts => acc.add(ts));
      return acc;
    }, new Set<number>());

    const sortedIntervals = Array.from(allIntervals).sort((a, b) => a - b);
    const keepIntervals = new Set(sortedIntervals.slice(-this.cameras.length));

    this.cameras.forEach(camera => {
      Array.from(camera.intervals.keys()).forEach(ts => {
        if (!keepIntervals.has(ts)) {
          camera.intervals.delete(ts);
        }
      });

      Array.from(camera.processedTimestamps).forEach(rawTs => {
        const intervalTs = this.roundToInterval(new Date(rawTs));
        if (!keepIntervals.has(intervalTs)) {
          camera.processedTimestamps.delete(rawTs);
        }
      });
    });
  }

  private roundToInterval(date: Date): number {
    return Math.floor(date.getTime() / this.intervalSize) * this.intervalSize;
  }

  private updateTimeIntervals(): void {
    const allIntervals = new Set<number>();
    this.cameras.forEach(camera => {
      Array.from(camera.intervals.keys()).forEach(ts => allIntervals.add(ts));
    });

    this.timeIntervals = Array.from(allIntervals)
      .sort((a, b) => a - b)
      .slice(this.cameras.length < 3 ? -3 : -this.cameras.length);
  }

  getColorForCamera(time: number, camera: CameraData): string {
    const value = camera.intervals.get(time) || 0;
    return this.interpolateColor(value);
  }

  interpolateColor(value: number) {
    const start = { r: 0x50, g: 0xa0, b: 0xe9 }; // #50a0e9
    const end   = { r: 0xd4, g: 0x66, b: 0x84 }; // #d46684
    const t = Math.min(value / 10, 1);

    const r = Math.round(start.r + (end.r - start.r) * t);
    const g = Math.round(start.g + (end.g - start.g) * t);
    const b = Math.round(start.b + (end.b - start.b) * t);

    return `rgb(${r}, ${g}, ${b})`;
  }

  getTooltipText(time: number, camera: CameraData): string {
    return `
      Камера: ${camera.local_ip}
      Время: ${this.formatTimeRange(time)}
      Людей: ${camera.intervals.get(time) || 0}
    `;
  }

  private formatTimeRange(timestamp: number): string {
    const start = new Date(timestamp);
    const end = new Date(timestamp + this.intervalSize);
    return `${start.toLocaleTimeString('ru-RU',
      { hour: '2-digit', minute: '2-digit', second: '2-digit' })} -
      ${end.toLocaleTimeString('ru-RU', { second: '2-digit' })}`;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
