import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarJuegosComponent } from './registrar-juegos.component';

describe('RegistrarJuegosComponent', () => {
  let component: RegistrarJuegosComponent;
  let fixture: ComponentFixture<RegistrarJuegosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarJuegosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarJuegosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
