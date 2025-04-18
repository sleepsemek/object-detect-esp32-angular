import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraGraphsComponent } from './camera-graphs.component';

describe('CameraGraphsComponent', () => {
  let component: CameraGraphsComponent;
  let fixture: ComponentFixture<CameraGraphsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraGraphsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
