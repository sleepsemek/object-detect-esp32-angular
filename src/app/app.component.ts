import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CameraMainComponent } from './camera-main/camera-main.component';
import { CameraSidebarComponent } from './camera-sidebar/camera-sidebar.component';
import { CommonModule } from '@angular/common';
import {CameraGraphsComponent} from './camera-graphs/camera-graphs.component';
import {HeatmapComponent} from './heatmap/heatmap.component';
import {MatMenu, MatMenuTrigger} from '@angular/material/menu';
import {CameraSettingsComponent} from './camera-settings/camera-settings.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    CameraMainComponent,
    CameraSidebarComponent,
    CameraGraphsComponent,
    HeatmapComponent,
    MatMenu,
    CameraSettingsComponent,
    MatMenuTrigger
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {}

