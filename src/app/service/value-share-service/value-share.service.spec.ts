import { TestBed } from '@angular/core/testing';

import { ValueShareService } from './value-share.service';

describe('ValueShareService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ValueShareService = TestBed.get(ValueShareService);
    expect(service).toBeTruthy();
  });
});
