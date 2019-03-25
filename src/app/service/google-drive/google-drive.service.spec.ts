import { TestBed } from '@angular/core/testing';

import { GoogleDriveService } from './google-drive.service';

describe('GoogleDriveService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GoogleDriveService = TestBed.get(GoogleDriveService);
    expect(service).toBeTruthy();
  });
});
