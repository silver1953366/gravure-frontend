import { TestBed } from '@angular/core/testing';

import { MaterialDimensionService } from './material-dimension.service';

describe('MaterialDimensionService', () => {
  let service: MaterialDimensionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaterialDimensionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
