import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraMainComponent } from './camera-main.component';

describe('CameraMainComponent', () => {
  let component: CameraMainComponent;
  let fixture: ComponentFixture<CameraMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
