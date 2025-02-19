import { TestBed } from '@angular/core/testing';

import { NotificarPublicacionService } from './notificar-publicacion.service';

describe('NotificarPublicacionService', () => {
  let service: NotificarPublicacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificarPublicacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
