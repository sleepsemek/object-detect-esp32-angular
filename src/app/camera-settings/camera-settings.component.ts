import {Component, effect, inject, WritableSignal, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { CameraSelectionService } from '../services/camera-selection.service';
import { MatMenuModule } from '@angular/material/menu';
import {toSignal} from '@angular/core/rxjs-interop';
import {CameraStreamService} from '../services/camera-stream.service';

type CameraSettingKey = keyof typeof CameraSettingsComponent.prototype.options;

@Component({
  standalone: true,
  selector: 'app-camera-settings',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    FormsModule,
    MatMenuModule
  ],
  templateUrl: './camera-settings.component.html',
  styleUrls: ['./camera-settings.component.scss']
})
export class CameraSettingsComponent {
  selection = inject(CameraSelectionService);
  selectedIp = toSignal(this.selection.selectedIp$, { initialValue: null });

  settings: WritableSignal<Partial<Record<CameraSettingKey, number>>> = signal({});

  options = {
    brightness: [-2, -1, 0, 1, 2],
    contrast: [-2, -1, 0, 1, 2],
    saturation: [-2, -1, 0, 1, 2],
    special_effect: [0, 1, 2, 3, 4, 5, 6],
    awb: [0, 1],
    awb_gain: [0, 1],
    wb_mode: [0, 1, 2, 3, 4],
    aec2: [0, 1],
    ae_level: [-2, -1, 0, 1, 2],
    aec_value: [0, 168, 300, 600, 900, 1200],
    agc_gain: [0, 1, 7, 15, 20, 25, 30],
    gain_ceiling: [0, 1, 2, 3, 4, 5, 6],
    bpc: [0, 1],
    wpc: [0, 1],
    raw_gma: [0, 1],
    v_flip: [0, 1],
    h_mirror: [0, 1],
    framesize: [4, 5, 6, 7, 8, 9, 10, 11, 12],
  };

  keys = Object.keys(this.options) as CameraSettingKey[];

  constructor(
    private stream: CameraStreamService,
  ) {
    effect(() => {
      const ip = this.selectedIp();
      if (!ip) {
        this.settings.set({});
        return;
      }

      fetch(`http://${ip}/setting`)
        .then(res => res.json())
        .then((data) => {
          const filtered: Partial<Record<CameraSettingKey, number>> = {};
          for (const key of this.keys) {
            if (key in data) {
              filtered[key] = data[key];
            }
          }
          this.settings.set(filtered);
        })
        .catch(err => console.error('Не удалось получить настройки камеры:', err));
    });
  }

  protected readonly Object = Object;

  async setOption(option: CameraSettingKey, value: number) {
    const ip = this.selectedIp();
    if (!ip) return;

    const img = document.querySelector('img') as HTMLImageElement;
    if (img) this.stream.stopStream(img);

    fetch(`http://${ip}/setting?${option}=${value}`)
      .then(res => res.json())
      .then((data: Record<string, number>) => {
        const filtered: Partial<Record<CameraSettingKey, number>> = {};
        for (const key of this.keys) {
          if (key in data) {
            filtered[key] = data[key];
          }
        }
        this.settings.set(filtered);
      })
      .catch(err => console.error('Не удалось получить настройки камеры:', err));

    if (img) this.stream.requestRestart();
  }

}
