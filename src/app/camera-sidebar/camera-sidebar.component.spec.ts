import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraSidebarComponent } from './camera-sidebar.component';

describe('CameraSidebarComponent', () => {
  let component: CameraSidebarComponent;
  let fixture: ComponentFixture<CameraSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
