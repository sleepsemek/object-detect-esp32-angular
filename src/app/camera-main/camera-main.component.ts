import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import {Subscription} from 'rxjs';
import {CameraSelectionService} from '../services/camera-selection.service';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {NgIf} from '@angular/common';
import {CameraStreamService} from '../services/camera-stream.service';
import {ApiService, CameraInference, InferenceData} from '../services/api.service';

@Component({
  selector: 'app-camera-main',
  standalone: true,
  imports: [
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader,
    MatProgressSpinner,
    NgIf,
  ],
  templateUrl: './camera-main.component.html',
  styleUrls: ['./camera-main.component.scss']
})
export class CameraMainComponent implements OnDestroy, AfterViewInit {
  selectedIp: string | null = null;
  loading = true;

  private sub = new Subscription();
  private clearTimeoutId: any | null = null;

  @ViewChild('streamImage') streamImage?: ElementRef<HTMLImageElement>;
  @ViewChild('overlayCanvas') overlayCanvas?: ElementRef<HTMLCanvasElement>;

  constructor(
    private selection: CameraSelectionService,
    private streamControl: CameraStreamService,
    private api: ApiService,
  ) {
    this.sub.add(
      this.selection.selectedIp$.subscribe(ip => {
        this.selectedIp = ip;
        this.loading = true;

        this.clearOverlay();
      })
    );

    this.sub.add(
      this.api.cameraInferences$.subscribe(allInferences => {
        if (!this.selectedIp) return;
        const camInference = allInferences.find(c => c.local_ip === this.selectedIp);
        if (camInference) {
          this.showCircles(camInference);
        }
      })
    )

    this.sub.add(
      this.streamControl.restart$.subscribe(() => {
        this.restartStream();
      })
    );
  }

  ngAfterViewInit() {
    this.restartStream();
  }

  restartStream() {
    const imgEl = this.streamImage?.nativeElement;
    if (!imgEl || !this.selectedIp) return;

    this.streamControl.stopStream(imgEl);
    this.loading = true;

    setTimeout(() => {
      this.streamControl.startStream(imgEl, this.selectedIp);
    }, 200);
  }

  onLoad() {
    this.loading = false;
    this.resizeCanvas();
  }

  private resizeCanvas() {
    const imgEl = this.streamImage?.nativeElement;
    const cvEl = this.overlayCanvas?.nativeElement;
    if (!imgEl || !cvEl) return;
    cvEl.width = imgEl.clientWidth;
    cvEl.height = imgEl.clientHeight;
  }

  private showCircles(camInf: CameraInference) {
    // Отменяем предыдущий таймаут
    if (this.clearTimeoutId) {
      clearTimeout(this.clearTimeoutId);
      this.clearTimeoutId = null;
    }

    // Очистка и ресайз перед рисованием
    this.clearOverlay();

    const cvEl = this.overlayCanvas?.nativeElement;
    const ctx = cvEl?.getContext('2d');
    if (!cvEl || !ctx) return;

    // Находим самый свежий инференс
    const latest = camInf.inferences.reduce((prev, curr) =>
      new Date(curr.timestamp).getTime() > new Date(prev.timestamp).getTime()
        ? curr
        : prev
    );

    // Синхронизируем размер канваса с картинкой
    this.resizeCanvas();

    // Коэффициенты масштабирования из условных единиц в пиксели
    // (берём из первого p любые frameW/frameH — они одинаковы для всех точек)
    const scaleX = 2; // фиксированный коэффициент по X
    const scaleY = 2; // фиксированный коэффициент по Y

    // Рисуем кружки в новых координатах
    (latest.data.person || []).forEach(p => {
      const [, x, y] = p;
      const cx = x * scaleX;
      const cy = y * scaleY;
      const radius = 20;  // в пикселях, можно тоже масштабировать, если нужно
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'red';
      ctx.stroke();
    });

    // Запускаем очистку через 2 сек
    this.clearTimeoutId = setTimeout(() => {
      this.clearOverlay();
      this.clearTimeoutId = null;
    }, 2000);
  }

  private clearOverlay() {
    const cvEl = this.overlayCanvas?.nativeElement;
    if (!cvEl) return;
    const ctx = cvEl.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, cvEl.width, cvEl.height);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    if (this.clearTimeoutId) {
      clearTimeout(this.clearTimeoutId);
    }
  }
}

