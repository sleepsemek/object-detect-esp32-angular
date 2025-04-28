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
  @ViewChild('streamImage') streamImage?: ElementRef<HTMLImageElement>;

  constructor(
    private selection: CameraSelectionService,
    private streamControl: CameraStreamService
  ) {
    this.sub.add(
      this.selection.selectedIp$.subscribe(ip => {
        this.selectedIp = ip;
        this.loading = true;
      })
    );

    this.sub.add(
      this.streamControl.restart$.subscribe(() => {
        this.restartStream();
      })
    );
  }

  ngAfterViewInit() {
    this.restartStream(); // Опциональный рестарт onDOMC
  }

  restartStream() {
    const img = this.streamImage?.nativeElement;
    if (!img || !this.selectedIp) return;

    this.streamControl.stopStream(img);

    this.loading = true;

    setTimeout(() => {
      this.streamControl.startStream(img, this.selectedIp);
    }, 200);
  }

  onLoad() {
    this.loading = false;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}

