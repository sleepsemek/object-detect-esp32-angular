import { TestBed } from '@angular/core/testing';

import { CameraSelectionService } from './camera-selection.service';

describe('CameraSelectionService', () => {
  let service: CameraSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CameraSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
