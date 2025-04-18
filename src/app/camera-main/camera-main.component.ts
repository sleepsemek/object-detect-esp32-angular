import {Component, OnDestroy} from '@angular/core';
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
export class CameraMainComponent implements OnDestroy {
  selectedIp: string | null = null;
  loading: boolean = true;
  private sub = new Subscription();

  constructor(private selection: CameraSelectionService) {
    this.sub.add(
      this.selection.selectedIp$.subscribe(ip => {
        this.selectedIp = ip;
        this.loading = true;
      })
    );
  }

  onLoad(): void {
    this.loading = false;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}

