import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarJuegosComponent } from './buscar-juegos.component';

describe('BuscarJuegosComponent', () => {
  let component: BuscarJuegosComponent;
  let fixture: ComponentFixture<BuscarJuegosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscarJuegosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscarJuegosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
