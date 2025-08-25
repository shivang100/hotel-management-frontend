import { TestBed } from '@angular/core/testing';

import { BookingFilterService } from './booking-filter.service';

describe('BookingFilterService', () => {
  let service: BookingFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookingFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
