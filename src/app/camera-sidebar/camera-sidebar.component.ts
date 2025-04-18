import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {ApiService, CameraEntry} from '../services/api.service';
import {FormsModule} from '@angular/forms';
import {CameraSelectionService} from '../services/camera-selection.service';

@Component({
  selector: 'app-camera-sidebar',
  imports: [
    CommonModule,
    MatExpansionModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    FormsModule,
  ],
  templateUrl: './camera-sidebar.component.html',
  styleUrl: './camera-sidebar.component.scss'
})
export class CameraSidebarComponent {
  cameras$: Observable<CameraEntry[]>;

  constructor(private cameraApi: ApiService, private selection: CameraSelectionService) {
    this.cameras$ = this.cameraApi.cameras$;
  }

  select(ip: string) {
    this.selection.selectCamera(ip);
  }

}
