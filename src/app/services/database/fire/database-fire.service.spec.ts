import { TestBed } from '@angular/core/testing';

import { DatabaseFireService } from './database-fire.service';

describe('DatabaseFireService', () => {
  let service: DatabaseFireService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatabaseFireService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
