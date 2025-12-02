import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Procuracao } from './procuracao';

describe('Procuracao', () => {
  let component: Procuracao;
  let fixture: ComponentFixture<Procuracao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Procuracao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Procuracao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
