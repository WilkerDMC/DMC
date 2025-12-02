import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Processos } from './processos';

describe('Processos', () => {
  let component: Processos;
  let fixture: ComponentFixture<Processos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Processos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Processos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
