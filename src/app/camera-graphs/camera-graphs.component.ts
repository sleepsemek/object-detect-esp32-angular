// Импорты остаются без изменений
import { Component, OnDestroy, OnInit, ViewChildren, QueryList } from '@angular/core';
import { BaseChartDirective } from "ng2-charts";
import { ChartConfiguration } from 'chart.js';
import { Subscription } from 'rxjs';
import { ApiService, CameraInference, InferenceData } from '../services/api.service';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelTitle, MatExpansionPanelHeader } from '@angular/material/expansion';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { NgClass, NgForOf } from '@angular/common';

@Component({
  selector: 'app-camera-graphs',
  templateUrl: './camera-graphs.component.html',
  imports: [
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader,
    MatCard,
    MatCardHeader,
    MatCardContent,
    NgClass,
    BaseChartDirective,
    NgForOf
  ],
  styleUrls: ['./camera-graphs.component.scss']
})
export class CameraGraphsComponent implements OnInit, OnDestroy {
  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    animation: { duration: 400, easing: 'easeOutQuart' },
    scales: {
      x: { type: 'category', ticks: { autoSkip: true, maxRotation: 0 } },
      y: { beginAtZero: true }
    },
    plugins: { legend: { display: false } }
  };

  cameraCharts: {
    local_ip: string;
    chartData: { labels: string[]; datasets: { label: string; data: number[] }[] };
    lastTimestamp?: string;
  }[] = [];

  private sub!: Subscription;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.sub = this.api.cameraInferences$.subscribe(results => {
      results.forEach(cam => this.processCamera(cam));
      this.updateCharts();
    });
  }

  private processCamera(cam: CameraInference): void {
    const chart = this.cameraCharts.find(c => c.local_ip === cam.local_ip);
    cam.inferences.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (!chart) {
      this.createNewChart(cam);
    } else {
      this.updateExistingChart(chart, cam);
    }
  }

  private createNewChart(cam: CameraInference): void {
    const labels = cam.inferences.map(i => this.formatTime(i.timestamp));
    const datasets = this.createDatasets(cam.inferences);

    this.cameraCharts.push({
      local_ip: cam.local_ip,
      chartData: { labels, datasets },
      lastTimestamp: cam.inferences[cam.inferences.length - 1]?.timestamp
    });
  }

  private updateExistingChart(chart: any, cam: CameraInference): void {
    const newInferences = cam.inferences.filter(i =>
      !chart.lastTimestamp || new Date(i.timestamp) > new Date(chart.lastTimestamp)
    );

    newInferences.forEach(inf => {
      chart.chartData.labels.push(this.formatTime(inf.timestamp));
      this.updateDatasets(chart.chartData.datasets, inf);
    });

    if (newInferences.length > 0) {
      chart.lastTimestamp = newInferences[newInferences.length - 1].timestamp;
    }
  }

  private createDatasets(inferences: InferenceData[]): any[] {
    const datasets = new Map<string, number[]>();

    inferences.forEach(inf => {
      for (const key in inf.data) {
        const group = inf.data[key];
        if (!group) continue;

        if (!datasets.has(key)) datasets.set(key, []);
        datasets.get(key)!.push(group.length);
      }
    });

    return Array.from(datasets.entries()).map(([label, data]) => ({ label, data }));
  }

  private updateDatasets(datasets: any[], inference: InferenceData): void {
    for (const key in inference.data) {
      const group = inference.data[key];
      if (!group) continue;

      const count = group.length;
      const dataset = datasets.find(d => d.label === key);

      if (dataset) {
        dataset.data.push(count);
      } else {
        const fillLength = datasets[0]?.data.length ?? 0;
        const newData = [...new Array(fillLength - 1).fill(null), count];
        datasets.push({ label: key, data: newData });
      }
    }
  }

  private formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private updateCharts(): void {
    setTimeout(() => this.charts.forEach(chart => chart.chart?.update()));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
