import { TestBed } from '@angular/core/testing';

import { ReceiptValidatorService } from './receipt-validator.service';

describe('ReceiptValidatorService', () => {
  let service: ReceiptValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReceiptValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
